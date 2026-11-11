"""Validate preservation, sanitize test evidence, and package Milestone 3.

Run from any directory after the final reports and all verification are complete:
    python Milestone3_Final_Evidence/tools/package_evidence.py

Only stdlib is required. Private source logs and credentials are never packaged.
The ZIP contains the report folder, with a manifest covering every other file.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import zipfile


ROOT = Path(__file__).resolve().parents[2]
PACKAGE = ROOT / "Milestone3_Final_Evidence"
PRIVATE = ROOT / ".milestone3"
SERVER = ROOT / "student-course-hub-master/server"
EVIDENCE = PACKAGE / "evidence"
ARCHIVE = ROOT / "SmartCourseHub_Milestone3_Final_Evidence.zip"
MANIFEST = EVIDENCE / "integrity-manifest.json"
REQUIRED_REPORTS = (
    "Milestone3_Report.md", "BUG01_Report.md", "BUG02_Report.md", "BUG03_Report.md",
    "Updated_Maintenance_Log.md", "Test_Results.md", "Regression_Test_Results.md",
    "Git_Commits.md", "Evidence_Index.md",
)
JWT = re.compile(r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b")
BCRYPT = re.compile(r"\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}")
EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
GENERATED_PASSWORD = re.compile(r"(Using generated security password:)\s*\S+", re.I)
JSON_SECRET = re.compile(
    r'("(?:password|token|access_token|refresh_token|secret|authorization)"\s*:\s*)"[^"\r\n]*"',
    re.I,
)
ASSIGNMENT_SECRET = re.compile(
    r"((?:spring\.datasource\.password|jwt\.secret|DB_PASSWORD|JWT_SECRET|MYSQL_PWD)\s*[=:]\s*)[^\s,;]+",
    re.I,
)


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def sha256(path: Path) -> str:
    with path.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256")
    return digest.hexdigest()


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def read_capture(path: Path) -> str:
    """Decode Windows PowerShell redirects before redaction, never as NUL text."""
    raw = path.read_bytes()
    if raw.startswith((b"\xff\xfe", b"\xfe\xff")):
        decoded = raw.decode("utf-16")
    else:
        try:
            decoded = raw.decode("utf-8-sig")
        except UnicodeDecodeError:
            # Maven launched from the Windows console may use its ANSI encoding.
            # Sensitive ASCII keys/tokens are preserved for sanitization.
            decoded = raw.decode("cp1252")
    if "\x00" in decoded:
        raise RuntimeError("NUL-containing text capture cannot be sanitized safely: " + path.name)
    return decoded


def known_secrets() -> set[str]:
    values = {os.environ.get(key, "") for key in ("DB_PASSWORD", "JWT_SECRET", "MYSQL_PWD")}
    props = SERVER / "src/main/resources/application.properties"
    if props.exists():
        source = props.read_text(encoding="utf-8")
        for match in re.finditer(r"(?mi)^\s*[^\r\n=]*(?:password|secret)\s*=\s*([^\r\n]+)", source):
            value = match[1].strip()
            placeholder = re.fullmatch(r"\$\{[^:}]+:([^}]*)\}", value)
            if placeholder:
                value = placeholder[1]
            elif value.startswith("${"):
                continue
            values.add(value)
    return {value for value in values if value and value != "[REDACTED]"}


def sanitize(text: str, secrets: set[str]) -> str:
    text = JWT.sub("[REDACTED_JWT]", text)
    text = BCRYPT.sub("[REDACTED_HASH]", text)
    text = GENERATED_PASSWORD.sub(r"\1 [REDACTED]", text)
    text = JSON_SECRET.sub(r'\1"[REDACTED]"', text)
    text = ASSIGNMENT_SECRET.sub(r"\1[REDACTED]", text)
    text = re.sub(r"(Bearer\s+)[^\s\]\"',}]+", r"\1[REDACTED]", text, flags=re.I)
    for value in sorted(secrets, key=len, reverse=True):
        text = text.replace(value, "[REDACTED]")
    text = EMAIL.sub("[REDACTED_EMAIL]", text)
    for path in (str(ROOT), ROOT.as_posix()):
        text = text.replace(path, "[WORKSPACE]")
    text = re.sub(r"[A-Za-z]:[\\/]Users[\\/][^\\/\s<]+", "[USERPROFILE]", text, flags=re.I)
    return text


def verify_preservation() -> dict:
    def verify_file_map(filename: str, enforce_m2_set: bool = False) -> dict:
        source = PRIVATE / filename
        expected = json.loads(source.read_text(encoding="utf-8"))
        mismatches = []
        for relative, digest in expected.items():
            path = ROOT / Path(relative.replace("\\", "/"))
            if not path.is_file() or sha256(path) != digest:
                mismatches.append(relative)
        if enforce_m2_set:
            original_names = {name.replace("\\", "/") for name in expected}
            current_names = {p.relative_to(ROOT).as_posix() for p in (ROOT / ".milestone2").rglob("*") if p.is_file()}
            mismatches.extend(sorted(original_names.symmetric_difference(current_names)))
        if mismatches:
            raise RuntimeError("Preservation check failed for " + filename + ": " + ", ".join(mismatches))
        return {"status": "PASS", "files_checked": len(expected), "baseline_sha256": sha256(source)}

    return {
        "timestamp_utc": now(),
        "milestone2": verify_file_map("m2-hashes.json", enforce_m2_set=True),
        "preexisting_working_tree_files": verify_file_map("preexisting-hashes.json"),
        "method": "SHA-256 comparison against private snapshots created before corrective changes",
    }


def collect_test_evidence(secrets: set[str]) -> None:
    destination = EVIDENCE / "maven"
    destination.mkdir(parents=True, exist_ok=True)
    source_logs = sorted(PRIVATE.glob("*maven*.log"))
    log_index = []
    for source in source_logs:
        target = destination / source.name
        target.write_text(sanitize(read_capture(source), secrets), encoding="utf-8")
        log_index.append({
            "file": target.relative_to(PACKAGE).as_posix(),
            "private_original_sha256": sha256(source),
            "sanitized_sha256": sha256(target),
            "method": "Credential, token, hash, email, and local user-path redaction; original retained privately",
        })
    reports = sorted((SERVER / "target/surefire-reports").glob("TEST-*.xml"))
    if not reports:
        raise RuntimeError("No Surefire XML results available; run the Maven test suite before packaging")
    suites = []
    for source in reports:
        suite = ET.parse(source).getroot()
        summary = {key: suite.get(key) for key in ("name", "tests", "failures", "errors", "skipped", "time")}
        summary["source_sha256"] = sha256(source)
        summary["testcases"] = []
        # Do not copy properties/environment or captured request/response dumps.
        # Test identities, outcomes and sanitized failure details suffice for evidence.
        clean = ET.Element("testsuite", {key: value for key, value in suite.attrib.items()
                                        if key in ("name", "tests", "failures", "errors", "skipped", "time")})
        for case in suite.findall("testcase"):
            result = "PASS"
            clean_case = ET.SubElement(clean, "testcase", {
                key: sanitize(value, secrets) for key, value in case.attrib.items()
                if key in ("classname", "name", "time")
            })
            for tag, label in (("failure", "FAIL"), ("error", "ERROR"), ("skipped", "SKIPPED")):
                for event in case.findall(tag):
                    result = label
                    clean_event = ET.SubElement(clean_case, tag, {
                        key: sanitize(value, secrets) for key, value in event.attrib.items()
                    })
                    clean_event.text = sanitize(event.text or "", secrets)
            summary["testcases"].append({
                "name": sanitize(case.get("name", ""), secrets),
                "class": case.get("classname", ""), "seconds": case.get("time"), "result": result,
            })
        target = destination / source.name
        ET.indent(clean, space="  ")
        ET.ElementTree(clean).write(target, encoding="utf-8", xml_declaration=True)
        suites.append(summary)
    totals = {key: sum(int(suite[key] or 0) for suite in suites) for key in ("tests", "failures", "errors", "skipped")}
    write_json(destination / "surefire-summary.json", {
        "captured_utc": now(), "source": "Latest server/target/surefire-reports TEST-*.xml files",
        "totals": totals, "suites": suites,
        "xml_redactions": "Properties and system output omitted; failure details sanitized",
        "logs": log_index,
    })


def package_files() -> list[Path]:
    files = []
    for path in PACKAGE.rglob("*"):
        relative = path.relative_to(PACKAGE)
        if any(part in ("__pycache__", ".git", ".milestone3", "node_modules") for part in relative.parts):
            continue
        if path.is_symlink():
            raise RuntimeError("Package must not include symbolic links: " + relative.as_posix())
        if path.is_file() and path.suffix.lower() not in (".pyc", ".pyo"):
            files.append(path)
    return sorted(files)


def scan_package(files: list[Path], secrets: set[str]) -> dict:
    findings = []
    textual = {".md", ".txt", ".json", ".xml", ".log", ".csv", ".ps1", ".py", ".sql", ".html"}
    for path in files:
        if path.suffix.lower() not in textual:
            continue
        content = path.read_text(encoding="utf-8", errors="replace")
        reasons = []
        if "\x00" in content:
            reasons.append("NUL-containing text/unsupported encoding")
        if JWT.search(content):
            reasons.append("unredacted JWT")
        if BCRYPT.search(content):
            reasons.append("unredacted bcrypt hash")
        for line in content.splitlines():
            if path.suffix.lower() != ".py" and re.search(r"Using generated security password:\s*(?!\[REDACTED\])\S+", line, re.I):
                reasons.append("unredacted generated password")
            if path.suffix.lower() == ".log" and re.search(r"(?:password|secret)\s*[=:]\s*[^\s]", line, re.I):
                # Log assignments must have every concrete sensitive value redacted.
                for match in re.finditer(r"(?:password|secret)\s*[=:]\s*([^\s,;]+)", line, re.I):
                    if not match[1].startswith(("[REDACTED", '"[REDACTED')):
                        reasons.append("unredacted password/secret log assignment")
        if any(value in content for value in secrets):
            reasons.append("known local secret")
        # Tool source contains redaction regex literals and no captured data.
        # Other structured captures must not contain non-placeholder secret strings.
        if path.suffix.lower() in {".json", ".xml", ".log"}:
            for match in JSON_SECRET.finditer(content):
                value = match.group(0).split(":", 1)[1].strip().strip('"')
                if value and not value.startswith("[REDACTED"):
                    reasons.append("unredacted structured secret")
        if reasons:
            findings.append({"file": path.relative_to(PACKAGE).as_posix(), "reasons": sorted(set(reasons))})
    if findings:
        # Never include secret values in error text.
        raise RuntimeError("Evidence privacy scan failed: " + json.dumps(findings))
    return {"status": "PASS", "files_scanned": len(files),
            "checks": ["JWT", "bcrypt", "generated security password", "password/secret log assignments",
                       "structured secret values", "known local credentials"],
            "scope": "Textual package artifacts; binary screenshots retain their documented source provenance"}


def main() -> None:
    missing = [name for name in REQUIRED_REPORTS if not (PACKAGE / name).is_file()]
    if missing:
        raise RuntimeError("Required final reports are missing: " + ", ".join(missing))
    preservation = verify_preservation()
    secrets = known_secrets()
    collect_test_evidence(secrets)
    write_json(EVIDENCE / "preservation-verification.json", preservation)
    files = package_files()
    scan = scan_package(files, secrets)
    write_json(EVIDENCE / "privacy-scan.json", {"timestamp_utc": now(), **scan})
    files = package_files()
    write_json(MANIFEST, {
        "created_utc": now(), "algorithm": "SHA-256",
        "scope": "Every package file except this manifest; caches and private directories excluded",
        "files": {path.relative_to(PACKAGE).as_posix(): sha256(path) for path in files if path != MANIFEST},
    })
    files = package_files()
    scan_package(files, secrets)
    with zipfile.ZipFile(ARCHIVE, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            archive.write(path, arcname=PACKAGE.name + "/" + path.relative_to(PACKAGE).as_posix())
    with zipfile.ZipFile(ARCHIVE) as archive:
        if archive.testzip() is not None:
            raise RuntimeError("ZIP CRC verification failed")
        expected = {PACKAGE.name + "/" + path.relative_to(PACKAGE).as_posix() for path in files}
        if set(archive.namelist()) != expected:
            raise RuntimeError("ZIP content verification failed")
        manifest = json.loads(archive.read(PACKAGE.name + "/" + MANIFEST.relative_to(PACKAGE).as_posix()))
        for relative, expected_hash in manifest["files"].items():
            actual = hashlib.sha256(archive.read(PACKAGE.name + "/" + relative)).hexdigest()
            if actual != expected_hash:
                raise RuntimeError("ZIP manifest verification failed for " + relative)
    print(json.dumps({"archive": str(ARCHIVE), "sha256": sha256(ARCHIVE), "files": len(files),
                      "preservation": "PASS", "privacy_scan": "PASS", "zip_integrity": "PASS"}, indent=2))


if __name__ == "__main__":
    main()
