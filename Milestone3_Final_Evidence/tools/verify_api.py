"""Milestone 3 API/MySQL verification. Credentials stay in memory.

Run from the repository root after compiling the selected corrective increment:
  python Milestone3_Final_Evidence/tools/verify_api.py start
  python Milestone3_Final_Evidence/tools/verify_api.py verify
  python Milestone3_Final_Evidence/tools/verify_api.py bug01

Only the isolated smartcoursehub_m2_test schema is an application target.
SQL is read-only; original-database access collects fingerprints only.
Existing Milestone 2 artifacts are never written. Test fixtures are retained.
"""
import argparse
import ctypes
from ctypes import wintypes
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import socket
import struct
import subprocess
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
SERVER = ROOT / "student-course-hub-master/server"
PRIVATE = ROOT / ".milestone3"
EVIDENCE = ROOT / "Milestone3_Final_Evidence/evidence"
PROPS = SERVER / "src/main/resources/application.properties"
JAVA_ROOT = SERVER / "src/main/java/io/khadijah/smartcoursehub"
DATABASE = "smartcoursehub_m2_test"
URL = "jdbc:mysql://localhost:3306/" + DATABASE
BASE = "http://127.0.0.1:8081"
POOL = "SmartCourseHubM3Test"
REDACTED = "[REDACTED]"


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def credential():
    if "DB_PASSWORD" in os.environ:
        return os.environ["DB_PASSWORD"]
    match = re.search(r"(?m)^spring\.datasource\.password=\$\{DB_PASSWORD:([^}\r\n]*)\}",
                      PROPS.read_text(encoding="utf-8"))
    if not match:
        raise RuntimeError("Set DB_PASSWORD privately before verification")
    return match[1]


def scrub(value, key=""):
    if re.search(r"password|token|secret|authorization", key, re.I):
        return REDACTED
    if isinstance(value, dict):
        return {str(k): scrub(v, str(k)) for k, v in value.items()}
    if isinstance(value, list):
        return [scrub(v, key) for v in value]
    if isinstance(value, str):
        if key.lower() in {"name", "studentname", "instructorname", "username", "authenticated_user"}:
            return value if value.startswith("M3 Synthetic") else REDACTED
        secret = credential()
        if secret:
            value = value.replace(secret, REDACTED)
        value = re.sub(r"eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", REDACTED, value)
        value = re.sub(r"\$2[aby]\$\d\d\$[A-Za-z0-9./]{53}", REDACTED, value)
        value = re.sub(r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
                       lambda m: m.group() if m.group().endswith("@example.test") else REDACTED, value)
        value = value.replace(str(ROOT), "[WORKSPACE]").replace(str(ROOT).replace("\\", "/"), "[WORKSPACE]")
        value = re.sub(r"[A-Za-z]:[\\/]Users[\\/][^\\/\s]+", "[LOCAL_USER]", value)
    return value


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(scrub(value), indent=2) + "\n", encoding="utf-8")


def mysql(sql):
    if not re.match(r"^\s*(SELECT|SHOW|CHECKSUM)\b", sql, re.I) or ";" in sql:
        raise RuntimeError("Verification SQL must be one read-only statement")
    executable = shutil.which("mysql")
    if not executable:
        raise RuntimeError("MySQL client unavailable")
    env = os.environ.copy()
    env["MYSQL_PWD"] = credential()
    result = subprocess.run([executable, "--protocol=TCP", "--host=localhost", "--port=3306",
                             "--user=" + os.environ.get("DB_USERNAME", "root"), "--connect-timeout=8",
                             "--batch", "--database=" + DATABASE, "--execute=" + sql],
                            env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode:
        raise RuntimeError(scrub(result.stderr))
    lines = result.stdout.strip().splitlines()
    if not lines:
        return []
    return [dict(zip(lines[0].split("\t"), line.split("\t"))) for line in lines[1:]]


def connection():
    rows = mysql("SELECT DATABASE() AS connected_database, VERSION() AS mysql_version, @@port AS mysql_port")
    if len(rows) != 1 or rows[0]["connected_database"] != DATABASE:
        raise RuntimeError("Database isolation failed")
    return rows[0]


def original_snapshot():
    tables = mysql("SELECT TABLE_NAME AS table_name FROM information_schema.TABLES "
                   "WHERE TABLE_SCHEMA='smartcoursehub_db' ORDER BY TABLE_NAME")
    snapshot = {}
    for row in tables:
        name = row["table_name"]
        if not re.fullmatch(r"[A-Za-z0-9_]+", name):
            raise RuntimeError("Unexpected SQL identifier")
        qualified = "`smartcoursehub_db`.`" + name + "`"
        count = mysql("SELECT COUNT(*) AS n FROM " + qualified)[0]["n"]
        checksum = mysql("CHECKSUM TABLE " + qualified + " EXTENDED")[0]["Checksum"]
        ddl = mysql("SHOW CREATE TABLE " + qualified)[0]
        snapshot[name] = {"row_count": int(count), "checksum": checksum,
                          "ddl_sha256": hashlib.sha256(json.dumps(ddl, sort_keys=True).encode()).hexdigest()}
    if not snapshot:
        raise RuntimeError("Original database fingerprint unavailable")
    return snapshot


def port_owners():
    api = ctypes.WinDLL("iphlpapi").GetExtendedTcpTable
    api.argtypes = [ctypes.c_void_p, ctypes.POINTER(wintypes.ULONG), wintypes.BOOL,
                    wintypes.ULONG, ctypes.c_int, wintypes.ULONG]
    api.restype = wintypes.ULONG
    size = wintypes.ULONG()
    code = api(None, ctypes.byref(size), False, socket.AF_INET, 5, 0)
    if code not in (0, 122):
        raise RuntimeError("Cannot inspect TCP ownership")
    for _ in range(3):
        buffer = ctypes.create_string_buffer(size.value)
        code = api(buffer, ctypes.byref(size), False, socket.AF_INET, 5, 0)
        if code == 122:
            continue
        if code:
            raise RuntimeError("Cannot inspect TCP ownership")
        owners = []
        for index in range(struct.unpack_from("<I", buffer.raw)[0]):
            _, address, port, _, _, pid = struct.unpack_from("<6I", buffer.raw, 4 + index * 24)
            if socket.inet_ntoa(struct.pack("<I", address)) == "127.0.0.1" and socket.ntohs(port & 65535) == 8081:
                owners.append(pid)
        return owners
    raise RuntimeError("TCP ownership kept changing")


def runtime():
    return json.loads((PRIVATE / "runtime.json").read_text(encoding="utf-8"))


def start():
    connection()
    if port_owners():
        raise RuntimeError("Port 8081 is occupied; stop its identified owner separately")
    PRIVATE.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    before = EVIDENCE / ("original-database-before-launch-" + stamp + ".json")
    save(before, {"captured_utc": now(), "database": "smartcoursehub_db", "fingerprints": original_snapshot()})
    classpath_file = ROOT / ".milestone2/classpath.txt"
    classpath = str(SERVER / "target/classes") + os.pathsep + classpath_file.read_text().strip()
    java = Path(os.environ.get("JAVA_HOME", "")) / "bin/java.exe"
    if not java.is_file():
        raise RuntimeError("JAVA_HOME must identify the JDK used for this run")
    env = os.environ.copy()
    for key in list(env):
        if key.startswith(("SPRING_", "LOGGING_")) or key in {"JAVA_TOOL_OPTIONS", "_JAVA_OPTIONS", "JDK_JAVA_OPTIONS"}:
            env.pop(key)
    env.update(DB_URL=URL, DB_USERNAME=os.environ.get("DB_USERNAME", "root"), DB_PASSWORD=credential(),
               JPA_DDL_AUTO="none", PORT="8081")
    command = [str(java), "-cp", classpath, "io.khadijah.smartcoursehub.SmartCourseHubApplication",
               "--server.address=127.0.0.1", "--server.port=8081", "--spring.datasource.url=" + URL,
               "--spring.jpa.hibernate.ddl-auto=none", "--spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect",
               "--spring.datasource.hikari.pool-name=" + POOL,
               "--logging.level.com.zaxxer.hikari.HikariConfig=DEBUG",
               "--logging.level.org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration=ERROR"]
    log_path = PRIVATE / ("backend-" + stamp + ".log")
    with log_path.open("wb", buffering=0) as log:
        process = subprocess.Popen(command, cwd=SERVER, env=env, stdin=subprocess.DEVNULL,
                                   stdout=log, stderr=subprocess.STDOUT, creationflags=subprocess.CREATE_NO_WINDOW)
    # This private metadata contains no environment, tokens, or credentials.
    (PRIVATE / "runtime.json").write_text(json.dumps({"pid": process.pid, "started_utc": now(),
        "jdbc_url": URL, "ddl_auto": "none", "port": 8081, "log": str(log_path),
        "original_before": str(before), "java": str(java)}, indent=2), encoding="utf-8")
    print("Launched isolated backend PID=" + str(process.pid) + "; run verify after initialization")


def verify():
    state = runtime()
    log = Path(state["log"]).read_text(encoding="utf-8", errors="replace")
    jdbc = [line for line in log.splitlines() if "jdbcUrl" in line]
    if state["jdbc_url"] != URL or state["ddl_auto"] != "none" or not jdbc or not all(URL in line for line in jdbc):
        raise RuntimeError("Effective isolated JDBC URL not verified")
    if "Started SmartCourseHubApplication" not in log or "Tomcat started on port 8081" not in log:
        raise RuntimeError("Backend startup not complete")
    if state["pid"] not in port_owners():
        raise RuntimeError("Listener PID differs from launched isolated backend")
    pools = mysql("SELECT ID AS connection_id, DB AS database_name FROM information_schema.PROCESSLIST "
                  "WHERE ID <> CONNECTION_ID() AND DB='smartcoursehub_m2_test' ORDER BY ID")
    if not pools:
        raise RuntimeError("No application pool connections in isolated schema")
    evidence = {"captured_utc": now(), "status": "VERIFIED", "pid": state["pid"], "connection": connection(),
                "ddl_auto": state["ddl_auto"], "hikari_jdbc_lines": jdbc, "mysql_pool_connections": pools,
                "java_version": subprocess.run([state["java"], "-version"], capture_output=True, text=True).stderr}
    save(EVIDENCE / "environment-verification.json", evidence)
    print("VERIFIED isolated backend, listener ownership, Hikari URL and MySQL pool")
    return evidence


def guard():
    state = runtime()
    verified = json.loads((EVIDENCE / "environment-verification.json").read_text())
    if verified.get("status") != "VERIFIED" or verified["pid"] != state["pid"] or state["jdbc_url"] != URL:
        raise RuntimeError("Current isolated process needs verification")
    if state["pid"] not in port_owners():
        raise RuntimeError("Port is not owned by verified backend")
    connection()


def admin_credentials():
    source = (JAVA_ROOT / "config/DataInitializer.java").read_text(encoding="utf-8")
    block = source.split("private void createAdminUser()", 1)[1].split("private void loadCoursesFromCSV", 1)[0]
    email = re.search(r'\.email\("([^\"]+)"\)', block)
    password = re.search(r'passwordEncoder\.encode\("([^\"]+)"\)', block)
    if not email or not password:
        raise RuntimeError("Existing isolated initializer admin credentials unavailable")
    return {"email": email[1], "password": password[1]}


class Verification:
    def __init__(self, bug):
        guard()
        self.run_id = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + secrets.token_hex(3)
        self.directory = EVIDENCE / (bug.lower() + "-" + self.run_id)
        self.events = []
        self.checks = []
        self.original_before = original_snapshot()
        save(self.directory / "original-database-before.json", self.original_before)

    def request(self, label, method, path, body=None, token=None):
        guard()
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = "Bearer " + token
        request = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None,
                                         headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                status, payload = response.status, response.read().decode("utf-8")
        except urllib.error.HTTPError as error:
            status, payload = error.code, error.read().decode("utf-8")
        try:
            payload = json.loads(payload)
        except json.JSONDecodeError:
            pass
        result = {"status": status, "body": payload}
        self.events.append({"timestamp": now(), "label": label,
                            "request": {"method": method, "path": path, "authenticated": bool(token), "body": body},
                            "response": result})
        save(self.directory / "http-transcript.json", self.events)
        return result

    def check(self, case, condition, expected, actual):
        self.checks.append({"case": case, "status": "PASS" if condition else "FAIL",
                            "expected": expected, "actual": actual})

    def data(self, response):
        if response["status"] != 200 or not isinstance(response["body"], dict) or not response["body"].get("success"):
            raise RuntimeError("API prerequisite failed; see sanitized transcript")
        return response["body"]["data"]

    def sql(self, label, query):
        rows = mysql(query)
        save(self.directory / (label + ".json"), {"timestamp": now(), "database": DATABASE, "query": query, "rows": rows})
        return rows

    def fixture(self, role):
        return {"name": "M3 Synthetic " + role.title(),
                "email": "m3-" + role.lower() + "-" + self.run_id.lower() + "@example.test",
                "password": secrets.token_urlsafe(24), "role": role}

    def finish(self, error=None):
        after = original_snapshot()
        save(self.directory / "original-database-after.json", after)
        unchanged = self.original_before == after
        self.check("original-database-preserved", unchanged, "All table fingerprints unchanged", unchanged)
        result = {"run_id": self.run_id, "completed_utc": now(), "database": DATABASE,
                  "checks": self.checks, "passed": sum(c["status"] == "PASS" for c in self.checks),
                  "failed": sum(c["status"] == "FAIL" for c in self.checks),
                  "original_database_unchanged": unchanged, "error": error,
                  "status": "PASS" if not error and all(c["status"] == "PASS" for c in self.checks) else "FAIL"}
        save(self.directory / "results.json", result)
        print(json.dumps({"status": result["status"], "passed": result["passed"], "failed": result["failed"],
                          "evidence": str(self.directory.relative_to(ROOT)), "error": scrub(error)}, indent=2))
        return result["status"] == "PASS"


def bug01():
    test = Verification("BUG01")
    error = None
    try:
        access = "/api/admin/users/role/M3_NONEXISTENT"
        anonymous = test.request("anonymous admin API denied", "GET", access)
        test.check("anonymous-admin-denied", anonymous["status"] in (401, 403), "401 or 403", anonymous["status"])
        for index, role in enumerate(("ADMIN", "admin", "AdMiN", "INSTRUCTOR", "instructor", "UNKNOWN")):
            fixture = test.fixture(role)
            fixture["email"] = "m3-public-" + secrets.token_hex(5) + "@example.test"
            result = test.request("public role " + role + " rejected", "POST", "/api/auth/register", fixture)
            test.check("public-" + role + "-rejected", result["status"] == 400, "400", result["status"])
            rows = test.sql("public-" + str(index) + "-" + role + "-persistence", "SELECT COUNT(*) AS n FROM users WHERE email='" + fixture["email"] + "'")
            test.check("public-" + role + "-not-persisted", rows[0]["n"] == "0", "0 rows", rows)
        student = test.fixture("STUDENT")
        registered = test.data(test.request("normal student registration", "POST", "/api/auth/register", student))
        test.check("student-role", registered["role"] == "STUDENT", "STUDENT", registered["role"])
        logged = test.data(test.request("normal student login", "POST", "/api/auth/login",
                                      {"email": student["email"], "password": student["password"]}))
        test.check("student-login", logged["userId"] == registered["userId"], "same registered ID", logged["userId"])
        denied = test.request("student admin API denied", "GET", access, token=logged["token"])
        test.check("student-admin-denied", denied["status"] == 403, "403", denied["status"])
        bad = test.request("wrong login password rejected", "POST", "/api/auth/login",
                           {"email": student["email"], "password": secrets.token_urlsafe(24)})
        test.check("wrong-password-rejected", bad["status"] in (400, 401), "400 or 401", bad["status"])
        admin = test.data(test.request("existing administrator login", "POST", "/api/auth/login", admin_credentials()))
        allowed = test.request("existing administrator access preserved", "GET", access, token=admin["token"])
        test.check("existing-admin-access", allowed["status"] == 200, "200", allowed["status"])
        for role in ("ADMIN", "INSTRUCTOR"):
            fixture = test.fixture(role)
            created = test.data(test.request("authorized administrator creates " + role, "POST", "/api/admin/users", fixture, admin["token"]))
            login = test.data(test.request("provisioned " + role + " login", "POST", "/api/auth/login",
                                           {"email": fixture["email"], "password": fixture["password"]}))
            test.check("provisioned-" + role + "-login", login["role"] == role and login["userId"] == created,
                       "correct role and created ID", {"role": login["role"], "userId": login["userId"]})
            rows = test.sql("authorized-" + role + "-persistence", "SELECT id, role, CAST(enabled AS UNSIGNED) AS enabled FROM users WHERE id=" + str(created))
            test.check("authorized-" + role + "-persisted", rows[0]["role"] == role and rows[0]["enabled"] == "1", "enabled " + role, rows)
            response = test.request("provisioned " + role + " administrative role control", "GET", access, token=login["token"])
            expected = 200 if role == "ADMIN" else 403
            test.check("provisioned-" + role + "-authorization", response["status"] == expected, expected, response["status"])
    except Exception as exc:
        error = str(exc)
    return test.finish(error)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["start", "verify", "bug01"])
    args = parser.parse_args()
    if args.command == "start":
        start()
    elif args.command == "verify":
        verify()
    elif not bug01():
        raise SystemExit(1)


if __name__ == "__main__":
    main()
