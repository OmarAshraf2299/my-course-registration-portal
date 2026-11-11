"""Capture genuine headless Chrome screenshots of packaged sanitized JSON evidence.

These are browser views of recorded API/MySQL verification evidence, not
screenshots of the SmartCourseHub application interface. Run after final tests:
  python Milestone3_Final_Evidence/tools/capture_evidence.py

Only files already inside the public evidence folder can be opened. Private
logs, credentials and runtime state are never inputs. Chrome uses an isolated
private profile outside the submission folder and no visible window.
"""
from pathlib import Path
import datetime as dt
import hashlib
import json
import os
import re
import subprocess


ROOT = Path(__file__).resolve().parents[2]
PACKAGE = ROOT / "Milestone3_Final_Evidence"
EVIDENCE = PACKAGE / "evidence"
DESTINATION = EVIDENCE / "screenshots"
PRIVATE = ROOT / ".milestone3/browser-private"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def browser():
    candidates = [
        Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
        Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    raise RuntimeError("Chrome or Edge is unavailable; screenshots not captured")


def select_sources():
    selected = []
    # Capture the latest completed run for each defect; earlier attempts remain in JSON.
    # the result file itself states PASS/FAIL and is not relabelled here.
    for path in [sorted(EVIDENCE.glob(prefix + "-*/results.json"))[-1] for prefix in ("bug01", "bug02", "bug03")]:
        selected.append(path)
        # Database evidence is compact and proves persisted rows independently
        # of the HTTP response. Avoid large transcript screenshots and copies
        # of private process logs.
        for candidate in sorted(path.parent.glob("*.json")):
            if re.search(r"database|persistence|duplicate|summary", candidate.stem, re.I):
                if not candidate.name.startswith("original-database"):
                    selected.append(candidate)
    for path in [EVIDENCE / "environment-verification.json", EVIDENCE / "preservation-verification.json"]:
        if path.is_file():
            selected.append(path)
    if not selected:
        raise RuntimeError("No completed sanitized verification evidence found")
    return selected


def validate_source(path):
    resolved = path.resolve(strict=True)
    if not resolved.is_relative_to(EVIDENCE.resolve()):
        raise RuntimeError("Screenshot source must be packaged public evidence")
    content = resolved.read_text(encoding="utf-8")
    json.loads(content)
    if re.search(r"eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", content):
        raise RuntimeError("Unredacted JWT detected; refusing capture")
    if re.search(r"\$2[aby]\$\d\d\$[A-Za-z0-9./]{53}", content):
        raise RuntimeError("Unredacted password hash detected; refusing capture")
    if re.search(r"Using generated security password:", content, re.I):
        raise RuntimeError("Private application log detected; refusing capture")
    return resolved


def main():
    executable = browser()
    DESTINATION.mkdir(parents=True, exist_ok=True)
    PRIVATE.mkdir(parents=True, exist_ok=True)
    receipt = {
        "description": "Authentic browser screenshots of recorded sanitized API/MySQL evidence JSON files. These are not SmartCourseHub application UI screenshots.",
        "browser": executable.name,
        "viewport": {"width": 1600, "height": 1200},
        "capture_method": "Installed Chrome/Edge headless --screenshot opening original packaged JSON via file URL; no image editing or synthetic application UI.",
        "captures": [],
    }
    receipt["browser_executable_sha256"] = digest(executable)
    for index, source in enumerate(select_sources(), 1):
        source = validate_source(source)
        label = source.parent.name + "-" + source.stem
        filename = re.sub(r"[^A-Za-z0-9_.-]", "_", label) + ".png"
        screenshot = DESTINATION / filename
        if screenshot.exists():
            raise RuntimeError("Existing screenshot retained; choose a fresh evidence package rather than overwrite: " + filename)
        command = [str(executable), "--headless=new", "--disable-gpu", "--hide-scrollbars",
                   "--no-first-run", "--no-default-browser-check", "--disable-extensions",
                   "--disable-background-networking", "--user-data-dir=" + str(PRIVATE),
                   "--window-size=1600,1200", "--screenshot=" + str(screenshot), source.as_uri()]
        result = subprocess.run(command, capture_output=True, text=True, timeout=45,
                                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
        if result.returncode or not screenshot.is_file():
            raise RuntimeError("Browser screenshot failed for " + str(source.relative_to(PACKAGE)))
        receipt["captures"].append({
            "captured_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
            "source": source.relative_to(PACKAGE).as_posix(),
            "source_sha256": digest(source),
            "screenshot": screenshot.relative_to(PACKAGE).as_posix(),
            "screenshot_sha256": digest(screenshot),
            "label": "Browser view of recorded sanitized evidence; not application UI",
        })
        # Preserve provenance after every completed real capture.
        (DESTINATION / "provenance.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
        print("Captured " + str(index) + ": " + str(screenshot.relative_to(PACKAGE)), flush=True)
    print("Captured " + str(len(receipt["captures"])) + " authentic evidence browser screenshots")


if __name__ == "__main__":
    main()
