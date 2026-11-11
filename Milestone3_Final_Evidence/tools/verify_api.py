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
from concurrent.futures import ThreadPoolExecutor
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
import threading
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
            state, address, port, remote_address, remote_port, pid = struct.unpack_from("<6I", buffer.raw, 4 + index * 24)
            # Some Windows providers expose an unspecified state (0). A live
            # PID with no remote endpoint identifies the listening socket;
            # PID=0 TIME_WAIT rows must never qualify as process ownership.
            if pid > 0 and state in (0, 2) and remote_address == 0 and remote_port == 0 and socket.inet_ntoa(struct.pack("<I", address)) == "127.0.0.1" and socket.ntohs(port & 65535) == 8081:
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
    command = [str(java), "-Dspring.devtools.restart.enabled=false", "-cp", classpath, "io.khadijah.smartcoursehub.SmartCourseHubApplication",
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


def stop():
    """Stop only the exact PID whose command and listener match our private state."""
    state = runtime()
    process_id = int(state["pid"])
    if state["jdbc_url"] != URL or state["ddl_auto"] != "none" or process_id not in port_owners():
        raise RuntimeError("Refusing restart: recorded isolated PID does not own port 8081")
    command = ("Get-CimInstance Win32_Process -Filter 'ProcessId=" + str(process_id)
               + "' | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress")
    observed = subprocess.run(["powershell.exe", "-NoProfile", "-Command", command],
                              capture_output=True, text=True, check=True)
    process = json.loads(observed.stdout)
    args = process.get("CommandLine", "")
    if process["ProcessId"] != process_id or not all(part in args for part in
            ("io.khadijah.smartcoursehub.SmartCourseHubApplication", "--spring.datasource.url=" + URL,
             "--spring.jpa.hibernate.ddl-auto=none", "--spring.datasource.hikari.pool-name=" + POOL)):
        raise RuntimeError("Refusing restart: PID command does not match our isolated application")
    stopped = subprocess.run(["taskkill.exe", "/PID", str(process_id), "/F"], capture_output=True, text=True)
    if stopped.returncode:
        raise RuntimeError("Could not stop the exact verified backend PID")
    for _ in range(30):
        if process_id not in port_owners():
            break
        time.sleep(0.1)
    if port_owners():
        raise RuntimeError("Port 8081 is occupied after stopping our PID")
    print("Stopped exact managed backend PID=" + str(process_id))


def restart():
    stop()
    start()


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
        self.event_lock = threading.Lock()
        self.checks = []
        self.original_before = original_snapshot()
        save(self.directory / "original-database-before.json", self.original_before)

    def request(self, label, method, path, body=None, token=None, before_send=None):
        guard()
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = "Bearer " + token
        request = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None,
                                         headers=headers, method=method)
        if before_send is not None:
            before_send.wait(timeout=20)
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
        with self.event_lock:
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


def bug02():
    test = Verification("BUG02")
    error = None
    try:
        legacy_query = ("SELECT id, section_id, session_date, start_time, duration_minutes, created_by_teacher_id "
                        "FROM class_sessions WHERE id IN (1,2,3,4) ORDER BY id")
        # These are synthetic M2 rows identified by the preserved original evidence.
        legacy_before = test.sql("m2-sessions-before", legacy_query)
        admin = test.data(test.request("existing administrator login", "POST", "/api/auth/login", admin_credentials()))
        instructor_fixture = test.fixture("INSTRUCTOR")
        instructor_id = test.data(test.request("administrator provisions synthetic instructor", "POST", "/api/admin/users",
                                                instructor_fixture, admin["token"]))
        instructor = test.data(test.request("synthetic instructor login", "POST", "/api/auth/login",
                                            {"email": instructor_fixture["email"], "password": instructor_fixture["password"]}))
        course_id = test.data(test.request("create synthetic scheduling course", "POST", "/api/admin/courses",
                       {"code": "M3-" + test.run_id, "title": "M3 Synthetic Corrective Course",
                        "description": "Isolated corrective maintenance fixture", "creditHours": 3}, admin["token"]))
        section_id = test.data(test.request("create synthetic scheduling section", "POST", "/api/admin/sections",
                       {"courseId": course_id, "instructorId": instructor_id, "semester": "M3-SYNTHETIC",
                        "capacity": 10, "room": "M3-TEST", "schedule": "Synthetic Monday Wednesday 09:00"}, admin["token"]))
        path = "/api/sections/" + str(section_id) + "/sessions"
        token = instructor["token"]
        before = test.data(test.request("sessions before generation", "GET", path, token=token))
        test.check("initial-empty", before == [], "0 rows", len(before))
        first = test.data(test.request("initial weekly generation", "POST", path + "/week?startDate=2026-11-09", token=token))
        first_ids = sorted(row["id"] for row in first)
        test.check("initial-two", len(first) == 2 and len(set(first_ids)) == 2, "2 distinct session IDs", first_ids)
        repeated = test.data(test.request("exact weekly replay", "POST", path + "/week?startDate=2026-11-09", token=token))
        repeated_ids = sorted(row["id"] for row in repeated)
        after_repeat = test.data(test.request("sessions after exact replay", "GET", path, token=token))
        test.check("repeat-same-ids", repeated_ids == first_ids, first_ids, repeated_ids)
        test.check("repeat-two-rows", len(after_repeat) == 2, "2 rows", len(after_repeat))
        next_week = test.data(test.request("distinct next week", "POST", path + "/week?startDate=2026-11-16", token=token))
        after_next = test.data(test.request("sessions after next week", "GET", path, token=token))
        test.check("next-week-new-ids", not set(first_ids).intersection(row["id"] for row in next_week), "new IDs", [r["id"] for r in next_week])
        test.check("next-week-four-rows", len(after_next) == 4, "4 rows", len(after_next))
        overlap = test.data(test.request("overlap reuses Wednesday and adds Friday", "POST", path + "/week?startDate=2026-11-11", token=token))
        after_overlap = test.data(test.request("sessions after overlapping generation", "GET", path, token=token))
        overlap_existing = [r["id"] for r in overlap if r["sessionDate"] == "2026-11-11"]
        expected_existing = [r["id"] for r in first if r["sessionDate"] == "2026-11-11"]
        test.check("overlap-preserves-existing-id", overlap_existing == expected_existing, expected_existing, overlap_existing)
        test.check("overlap-adds-only-missing", len(after_overlap) == 5, "5 rows", len(after_overlap))
        barrier = threading.Barrier(4)
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(test.request, "concurrent weekly generation " + str(i + 1), "POST",
                                        path + "/week?startDate=2026-11-23", None, token, barrier) for i in range(4)]
            responses = [future.result(timeout=50) for future in futures]
        test.check("concurrent-all-success", all(r["status"] == 200 for r in responses), "4 HTTP 200 responses", [r["status"] for r in responses])
        concurrent_ids = [sorted(row["id"] for row in test.data(r)) for r in responses]
        test.check("concurrent-same-ids", all(ids == concurrent_ids[0] for ids in concurrent_ids) and len(concurrent_ids[0]) == 2,
                   "same 2 IDs in all responses", concurrent_ids)
        rows = test.sql("concurrent-week-database", "SELECT id, section_id, session_date, start_time FROM class_sessions WHERE section_id="
                        + str(section_id) + " AND session_date IN ('2026-11-23','2026-11-25') ORDER BY session_date,id")
        test.check("concurrent-two-persisted", len(rows) == 2, "2 rows", rows)
        duplicates = test.sql("fixture-duplicate-groups", "SELECT section_id, session_date, start_time, COUNT(*) AS n FROM class_sessions WHERE section_id="
                              + str(section_id) + " GROUP BY section_id,session_date,start_time HAVING COUNT(*)>1")
        test.check("no-new-duplicate-groups", not duplicates, "0 duplicate groups", duplicates)
        missing = test.request("missing section generation", "POST", "/api/sections/9223372036854775807/sessions/week?startDate=2026-11-09", token=token)
        test.check("missing-section-404", missing["status"] == 404, "404", missing["status"])
        invalid = test.request("invalid generation date", "POST", path + "/week?startDate=not-a-date", token=token)
        test.check("invalid-date-400", invalid["status"] == 400, "400", invalid["status"])
        legacy_after = test.sql("m2-sessions-after", legacy_query)
        test.check("m2-session-rows-preserved", legacy_before == legacy_after, legacy_before, legacy_after)
        save(test.directory / "fixture-identifiers.json", {"instructor_id": instructor_id, "instructor_email": instructor_fixture["email"],
              "course_id": course_id, "section_id": section_id, "session_ids": first_ids,
              "note": "Credentials are not retained. A fresh protected synthetic fixture may be used for subsequent verification."})
    except Exception as exc:
        error = str(exc)
    return test.finish(error)


def create_academic_fixture(test, enroll=True):
    admin = test.data(test.request("existing administrator login", "POST", "/api/auth/login", admin_credentials()))
    teacher_body = test.fixture("INSTRUCTOR")
    teacher_id = test.data(test.request("administrator provisions synthetic instructor", "POST", "/api/admin/users", teacher_body, admin["token"]))
    teacher = test.data(test.request("synthetic instructor login", "POST", "/api/auth/login",
                                    {"email": teacher_body["email"], "password": teacher_body["password"]}))
    student_body = test.fixture("STUDENT")
    student = test.data(test.request("public synthetic student registration", "POST", "/api/auth/register", student_body))
    logged = test.data(test.request("synthetic student login", "POST", "/api/auth/login",
                                   {"email": student_body["email"], "password": student_body["password"]}))
    test.check("student-login", logged["userId"] == student["userId"], "same registered ID", logged["userId"])
    course_id = test.data(test.request("create synthetic course", "POST", "/api/admin/courses",
                 {"code": "M3-" + test.run_id, "title": "M3 Synthetic Corrective Course", "creditHours": 3,
                  "description": "Isolated corrective maintenance verification"}, admin["token"]))
    section_id = test.data(test.request("create synthetic section", "POST", "/api/admin/sections",
                  {"courseId": course_id, "instructorId": teacher_id, "semester": "M3-SYNTHETIC", "capacity": 10,
                   "room": "M3-TEST", "schedule": "Synthetic Monday Wednesday 09:00"}, admin["token"]))
    enrollment_id = None
    if enroll:
        enrollment_id = test.data(test.request("enroll synthetic student", "POST", "/api/student/enrollments",
                                               {"sectionId": section_id}, student["token"]))
    return {"admin": admin, "teacher": teacher, "student": student, "student_body": student_body,
            "course_id": course_id, "section_id": section_id, "enrollment_id": enrollment_id}


def bug03():
    test = Verification("BUG03")
    error = None
    try:
        legacy_query = "SELECT id, session_id, student_id, status FROM attendance WHERE id IN (1,2) ORDER BY id"
        legacy_before = test.sql("m2-attendance-before", legacy_query)
        fixture = create_academic_fixture(test)
        teacher, student = fixture["teacher"], fixture["student"]
        section_id = fixture["section_id"]
        session_path = "/api/sections/" + str(section_id) + "/sessions"
        sessions = test.data(test.request("generate fresh attendance sessions", "POST", session_path + "/week?startDate=2026-11-09", token=teacher["token"]))
        session_id, concurrent_session_id = [session["id"] for session in sessions]
        path = "/api/sessions/" + str(session_id) + "/attendance"
        pair_query = ("SELECT id, session_id, student_id, status FROM attendance WHERE session_id=" + str(session_id)
                      + " AND student_id=" + str(student["userId"]) + " ORDER BY id")
        empty = test.data(test.request("attendance before first mark", "GET", path, token=teacher["token"]))
        test.check("initial-empty", empty == [], "0 rows", len(empty))
        present = [{"studentId": student["userId"], "status": "PRESENT"}]
        test.data(test.request("first attendance mark", "POST", path, present, teacher["token"]))
        first = test.data(test.request("attendance after first mark", "GET", path, token=teacher["token"]))
        test.check("first-one-row", len(first) == 1, "1 row", len(first))
        first_id = first[0]["id"]
        test.data(test.request("identical attendance replay", "POST", path, present, teacher["token"]))
        repeated = test.data(test.request("attendance after exact replay", "GET", path, token=teacher["token"]))
        test.check("repeat-one-same-id", len(repeated) == 1 and repeated[0]["id"] == first_id,
                   {"count": 1, "id": first_id}, {"count": len(repeated), "ids": [r["id"] for r in repeated]})
        test.sql("attendance-after-replay", pair_query)
        for status in ("PRESENT", "ABSENT", "LATE", "LEAVE"):
            test.data(test.request("set attendance " + status, "POST", path,
                                   [{"studentId": student["userId"], "status": status}], teacher["token"]))
            rows = test.sql("attendance-status-" + status.lower(), pair_query)
            test.check("status-" + status + "-updates-same-row", len(rows) == 1 and rows[0]["id"] == str(first_id) and rows[0]["status"] == status,
                       {"count": 1, "id": first_id, "status": status}, rows)
            summary = test.data(test.request("summary after " + status, "GET", "/api/student/attendance/summary", token=student["token"]))
            observed = next(row for row in summary if row["sectionId"] == section_id)
            present_count = 1 if status in ("PRESENT", "LATE") else 0
            expected = {"totalClasses": 1, "presentCount": present_count, "absentCount": 1 - present_count,
                        "attendancePercentage": float(present_count * 100)}
            actual = {key: observed[key] for key in expected}
            test.check("summary-" + status, actual == expected, expected, actual)
        batch = [{"studentId": student["userId"], "status": "ABSENT"}, {"studentId": student["userId"], "status": "PRESENT"}]
        test.data(test.request("same student repeated within one batch", "POST", path, batch, teacher["token"]))
        rows = test.sql("duplicate-batch-final-state", pair_query)
        test.check("duplicate-batch-one-final-status", len(rows) == 1 and rows[0]["id"] == str(first_id) and rows[0]["status"] == "PRESENT",
                   "same one row, final explicit PRESENT", rows)
        concurrent_path = "/api/sessions/" + str(concurrent_session_id) + "/attendance"
        barrier = threading.Barrier(4)
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(test.request, "concurrent first attendance mark " + str(i + 1), "POST",
                                        concurrent_path, present, teacher["token"], barrier) for i in range(4)]
            concurrent = [future.result(timeout=50) for future in futures]
        test.check("concurrent-all-success", all(r["status"] == 200 for r in concurrent), "4 HTTP 200 responses", [r["status"] for r in concurrent])
        rows = test.sql("concurrent-attendance-database", "SELECT id, session_id, student_id, status FROM attendance WHERE session_id="
                         + str(concurrent_session_id) + " AND student_id=" + str(student["userId"]) + " ORDER BY id")
        test.check("concurrent-one-row", len(rows) == 1 and rows[0]["status"] == "PRESENT", "1 PRESENT row", rows)
        outsider_body = test.fixture("STUDENT")
        outsider_body["email"] = "m3-unenrolled-" + test.run_id.lower() + "@example.test"
        outsider = test.data(test.request("register unenrolled synthetic student", "POST", "/api/auth/register", outsider_body))
        wrong_body = test.fixture("INSTRUCTOR")
        wrong_body["email"] = "m3-other-teacher-" + test.run_id.lower() + "@example.test"
        test.data(test.request("administrator provisions unrelated instructor", "POST", "/api/admin/users", wrong_body, fixture["admin"]["token"]))
        wrong_teacher = test.data(test.request("unrelated instructor login", "POST", "/api/auth/login",
                                               {"email": wrong_body["email"], "password": wrong_body["password"]}))
        invalid_cases = [
            ("invalid-status", [{"studentId": student["userId"], "status": "INVALID"}]),
            ("null-status", [{"studentId": student["userId"], "status": None}]),
            ("null-student", [{"studentId": None, "status": "PRESENT"}]),
            ("null-record", [None]),
            ("missing-body", None),
            ("unenrolled-student", [{"studentId": outsider["userId"], "status": "PRESENT"}]),
            ("missing-student", [{"studentId": 9223372036854775807, "status": "PRESENT"}]),
            ("batch-rollback", [{"studentId": student["userId"], "status": "ABSENT"},
                                {"studentId": outsider["userId"], "status": "PRESENT"}])]
        before_invalid = test.sql("before-invalid-requests", pair_query)
        for label, body in invalid_cases:
            response = test.request(label + " attendance request", "POST", path, body, teacher["token"])
            test.check(label + "-400", response["status"] == 400, "400", response["status"])
        wrong = test.request("unrelated instructor attendance rejected", "POST", path, present, wrong_teacher["token"])
        test.check("wrong-instructor-400", wrong["status"] == 400, "400", wrong["status"])
        missing = test.request("missing attendance session", "POST", "/api/sessions/9223372036854775807/attendance", present, teacher["token"])
        test.check("missing-session-404", missing["status"] == 404, "404", missing["status"])
        forbidden = test.request("student cannot mark attendance", "POST", path, present, student["token"])
        # Existing method-security exceptions are mapped to HTTP400 by the
        # application's exception handler. Preserve that API behavior while
        # requiring an explicit denial, rather than accepting arbitrary400.
        denied = (isinstance(forbidden["body"], dict) and forbidden["body"].get("success") is False
                  and forbidden["body"].get("message") == "Access Denied")
        test.check("student-marking-forbidden", forbidden["status"] in (400, 403) and denied,
                   "400 or 403 with success=false and Access Denied; subsequent database check unchanged", forbidden)
        after_invalid = test.sql("after-invalid-requests", pair_query)
        test.check("invalid-requests-preserve-record", before_invalid == after_invalid, before_invalid, after_invalid)
        scoped = test.sql("all-fixture-attendance", "SELECT a.id,a.session_id,a.student_id,a.status FROM attendance a JOIN class_sessions cs ON cs.id=a.session_id WHERE cs.section_id=" + str(section_id) + " ORDER BY a.id")
        test.check("invalid-requests-no-extra-records", len(scoped) == 2 and all(r["student_id"] == str(student["userId"]) for r in scoped), "2 legitimate rows only", scoped)
        summary = test.data(test.request("final student attendance summary", "GET", "/api/student/attendance/summary", token=student["token"]))
        observed = next(row for row in summary if row["sectionId"] == section_id)
        actual = {key: observed[key] for key in ("totalClasses", "presentCount", "absentCount", "attendancePercentage")}
        expected = {"totalClasses": 2, "presentCount": 2, "absentCount": 0, "attendancePercentage": 100.0}
        test.check("final-summary-two-distinct-sessions", actual == expected, expected, actual)
        legacy_after = test.sql("m2-attendance-after", legacy_query)
        test.check("m2-attendance-rows-preserved", legacy_before == legacy_after, legacy_before, legacy_after)
    except Exception as exc:
        error = str(exc)
    return test.finish(error)


def regression():
    test = Verification("REGRESSION")
    error = None
    try:
        fixture = create_academic_fixture(test, enroll=False)
        admin, teacher, student = fixture["admin"], fixture["teacher"], fixture["student"]
        section_id, course_id = fixture["section_id"], fixture["course_id"]
        available = test.data(test.request("student course browsing", "GET", "/api/student/sections/available", token=student["token"]))
        test.check("course-browsing", any(row["id"] == section_id for row in available), "new section visible", section_id)
        enroll_body = {"sectionId": section_id}
        enrollment_id = test.data(test.request("student enrollment", "POST", "/api/student/enrollments", enroll_body, student["token"]))
        duplicate = test.request("duplicate enrollment rejected", "POST", "/api/student/enrollments", enroll_body, student["token"])
        test.check("duplicate-enrollment-400", duplicate["status"] == 400, "400", duplicate["status"])
        active = test.data(test.request("active student enrollments", "GET", "/api/student/enrollments", token=student["token"]))
        test.check("enrollment-listed-active", len(active) == 1 and active[0]["id"] == enrollment_id and active[0]["status"] == "ENROLLED", "one active fixture enrollment", active)
        roster = test.data(test.request("instructor section roster", "GET", "/api/instructor/sections/" + str(section_id) + "/students", token=teacher["token"]))
        test.check("instructor-roster", any(row["studentId"] == student["userId"] for row in roster), "enrolled synthetic student visible", [r["studentId"] for r in roster])
        test.data(test.request("withdraw fixture enrollment", "POST", "/api/student/enrollments/" + str(enrollment_id) + "/drop", token=student["token"]))
        dropped = test.sql("withdrawal-database", "SELECT id,student_id,section_id,status FROM enrollments WHERE id=" + str(enrollment_id))
        test.check("withdrawal-status", dropped[0]["status"] == "DROPPED", "DROPPED", dropped)
        active = test.data(test.request("active enrollments after withdrawal", "GET", "/api/student/enrollments", token=student["token"]))
        test.check("withdrawal-removes-from-active", active == [], "0 active enrollments", active)
        reenrolled = test.data(test.request("reenroll dropped enrollment", "POST", "/api/student/enrollments", enroll_body, student["token"]))
        test.check("reenroll-reuses-id", reenrolled == enrollment_id, enrollment_id, reenrolled)
        persisted = test.sql("reenrollment-database", "SELECT id,student_id,section_id,status FROM enrollments WHERE id=" + str(enrollment_id))
        test.check("reenrollment-status", persisted[0]["status"] == "ENROLLED", "ENROLLED", persisted)
        test.data(test.request("administrator updates synthetic course", "PUT", "/api/admin/courses/" + str(course_id),
                               {"title": "M3 Synthetic Updated Course", "creditHours": 4}, admin["token"]))
        course = test.data(test.request("administrator retrieves updated course", "GET", "/api/admin/courses/" + str(course_id), token=admin["token"]))
        test.check("admin-course-update", course["title"] == "M3 Synthetic Updated Course" and course["creditHours"] == 4,
                   "updated synthetic title and 4 credit hours", {"title": course["title"], "creditHours": course["creditHours"]})
        test.data(test.request("administrator updates synthetic section", "PUT", "/api/admin/sections/" + str(section_id),
                               {"room": "M3-UPDATED", "capacity": 12}, admin["token"]))
        section = test.data(test.request("administrator retrieves updated section", "GET", "/api/admin/sections/" + str(section_id), token=admin["token"]))
        test.check("admin-section-update", section["room"] == "M3-UPDATED" and section["capacity"] == 12,
                   "M3-UPDATED room and capacity12", {"room": section["room"], "capacity": section["capacity"]})
        path = "/api/sections/" + str(section_id) + "/sessions/week?startDate=2026-11-09"
        first = test.data(test.request("regression weekly generation", "POST", path, token=teacher["token"]))
        second = test.data(test.request("regression weekly replay", "POST", path, token=teacher["token"]))
        test.check("session-generation-remains-idempotent", len(first) == 2 and sorted(r["id"] for r in first) == sorted(r["id"] for r in second),
                   "same two IDs", [[r["id"] for r in first], [r["id"] for r in second]])
        user_path = "/api/admin/users/" + str(student["userId"])
        test.data(test.request("administrator deactivates synthetic student", "POST", user_path + "/deactivate", token=admin["token"]))
        credentials = {"email": fixture["student_body"]["email"], "password": fixture["student_body"]["password"]}
        disabled = test.request("disabled student login rejected", "POST", "/api/auth/login", credentials)
        test.check("deactivated-login-rejected", disabled["status"] in (400, 401), "400 or 401", disabled["status"])
        test.data(test.request("administrator reactivates synthetic student", "POST", user_path + "/activate", token=admin["token"]))
        restored = test.data(test.request("reactivated student login succeeds", "POST", "/api/auth/login", credentials))
        test.check("reactivated-login-success", restored["userId"] == student["userId"], student["userId"], restored["userId"])
        forbidden = test.request("student admin API remains forbidden", "GET", "/api/admin/users/role/M3_NONEXISTENT", token=restored["token"])
        test.check("student-admin-still-forbidden", forbidden["status"] == 403, "403", forbidden["status"])
    except Exception as exc:
        error = str(exc)
    return test.finish(error)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["start", "stop", "restart", "verify", "bug01", "bug02", "bug03", "regression"])
    args = parser.parse_args()
    if args.command == "start":
        start()
    elif args.command == "stop":
        stop()
    elif args.command == "restart":
        restart()
    elif args.command == "verify":
        verify()
    elif not {"bug01": bug01, "bug02": bug02, "bug03": bug03, "regression": regression}[args.command]():
        raise SystemExit(1)


if __name__ == "__main__":
    main()
