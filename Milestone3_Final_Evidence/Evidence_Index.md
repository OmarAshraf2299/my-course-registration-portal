# Evidence Index

This index distinguishes original confirmed observations from post-fix verification. JSON captures are the source evidence; visual files illustrate those recorded results. No screenshot is claimed to exercise a React/application UI workflow.

## Reports

- [Milestone3_Report.md](Milestone3_Report.md)
- [BUG01_Report.md](BUG01_Report.md)
- [BUG02_Report.md](BUG02_Report.md)
- [BUG03_Report.md](BUG03_Report.md)
- [Updated_Maintenance_Log.md](Updated_Maintenance_Log.md)
- [Test_Results.md](Test_Results.md)
- [Regression_Test_Results.md](Regression_Test_Results.md)
- [Git_Commits.md](Git_Commits.md)

## Before evidence

Original observations were collected in Milestone 2 on 8 November 2026. Copies in `evidence/before/` retain original hashes and provenance. E02/E03/E04 PNGs are rendered authentic evidence excerpts, not application screenshots. The complete original `.milestone2/` evidence remains unchanged outside this package.

- [evidence/before/bug-01-enabled-recheck.json](evidence/before/bug-01-enabled-recheck.json)
- [evidence/before/BUG-01_Evidence.md](evidence/before/BUG-01_Evidence.md)
- [evidence/before/bug-02-database.json](evidence/before/bug-02-database.json)
- [evidence/before/BUG-02_Evidence.md](evidence/before/BUG-02_Evidence.md)
- [evidence/before/bug-03-database.json](evidence/before/bug-03-database.json)
- [evidence/before/BUG-03_Evidence.md](evidence/before/BUG-03_Evidence.md)
- [evidence/before/E02_BUG01.png](evidence/before/E02_BUG01.png)
- [evidence/before/E03_BUG02.png](evidence/before/E03_BUG02.png)
- [evidence/before/E04_BUG03.png](evidence/before/E04_BUG03.png)
- [evidence/before/provenance.json](evidence/before/provenance.json)

## Live after evidence

Each defect/regression run includes expected/actual checks, sanitized HTTP responses, read-only SQL results, and original-database fingerprints before/after. All synthetic fixtures remain in the isolated test database.

### bug01 — preserved earlier attempt: 25 passed, 0 failed

- [evidence/bug01-20261109T142919Z-84aac5/authorized-ADMIN-persistence.json](evidence/bug01-20261109T142919Z-84aac5/authorized-ADMIN-persistence.json)
- [evidence/bug01-20261109T142919Z-84aac5/authorized-INSTRUCTOR-persistence.json](evidence/bug01-20261109T142919Z-84aac5/authorized-INSTRUCTOR-persistence.json)
- [evidence/bug01-20261109T142919Z-84aac5/http-transcript.json](evidence/bug01-20261109T142919Z-84aac5/http-transcript.json)
- [evidence/bug01-20261109T142919Z-84aac5/original-database-after.json](evidence/bug01-20261109T142919Z-84aac5/original-database-after.json)
- [evidence/bug01-20261109T142919Z-84aac5/original-database-before.json](evidence/bug01-20261109T142919Z-84aac5/original-database-before.json)
- [evidence/bug01-20261109T142919Z-84aac5/public-0-ADMIN-persistence.json](evidence/bug01-20261109T142919Z-84aac5/public-0-ADMIN-persistence.json)
- [evidence/bug01-20261109T142919Z-84aac5/public-1-admin-persistence.json](evidence/bug01-20261109T142919Z-84aac5/public-1-admin-persistence.json)
- [evidence/bug01-20261109T142919Z-84aac5/public-2-AdMiN-persistence.json](evidence/bug01-20261109T142919Z-84aac5/public-2-AdMiN-persistence.json)
- [evidence/bug01-20261109T142919Z-84aac5/public-3-INSTRUCTOR-persistence.json](evidence/bug01-20261109T142919Z-84aac5/public-3-INSTRUCTOR-persistence.json)
- [evidence/bug01-20261109T142919Z-84aac5/public-4-instructor-persistence.json](evidence/bug01-20261109T142919Z-84aac5/public-4-instructor-persistence.json)
- [evidence/bug01-20261109T142919Z-84aac5/public-5-UNKNOWN-persistence.json](evidence/bug01-20261109T142919Z-84aac5/public-5-UNKNOWN-persistence.json)
- [evidence/bug01-20261109T142919Z-84aac5/results.json](evidence/bug01-20261109T142919Z-84aac5/results.json)

### bug01 — final selected run: 25 passed, 0 failed

- [evidence/bug01-20261111T185427Z-08e19d/authorized-ADMIN-persistence.json](evidence/bug01-20261111T185427Z-08e19d/authorized-ADMIN-persistence.json)
- [evidence/bug01-20261111T185427Z-08e19d/authorized-INSTRUCTOR-persistence.json](evidence/bug01-20261111T185427Z-08e19d/authorized-INSTRUCTOR-persistence.json)
- [evidence/bug01-20261111T185427Z-08e19d/http-transcript.json](evidence/bug01-20261111T185427Z-08e19d/http-transcript.json)
- [evidence/bug01-20261111T185427Z-08e19d/original-database-after.json](evidence/bug01-20261111T185427Z-08e19d/original-database-after.json)
- [evidence/bug01-20261111T185427Z-08e19d/original-database-before.json](evidence/bug01-20261111T185427Z-08e19d/original-database-before.json)
- [evidence/bug01-20261111T185427Z-08e19d/public-0-ADMIN-persistence.json](evidence/bug01-20261111T185427Z-08e19d/public-0-ADMIN-persistence.json)
- [evidence/bug01-20261111T185427Z-08e19d/public-1-admin-persistence.json](evidence/bug01-20261111T185427Z-08e19d/public-1-admin-persistence.json)
- [evidence/bug01-20261111T185427Z-08e19d/public-2-AdMiN-persistence.json](evidence/bug01-20261111T185427Z-08e19d/public-2-AdMiN-persistence.json)
- [evidence/bug01-20261111T185427Z-08e19d/public-3-INSTRUCTOR-persistence.json](evidence/bug01-20261111T185427Z-08e19d/public-3-INSTRUCTOR-persistence.json)
- [evidence/bug01-20261111T185427Z-08e19d/public-4-instructor-persistence.json](evidence/bug01-20261111T185427Z-08e19d/public-4-instructor-persistence.json)
- [evidence/bug01-20261111T185427Z-08e19d/public-5-UNKNOWN-persistence.json](evidence/bug01-20261111T185427Z-08e19d/public-5-UNKNOWN-persistence.json)
- [evidence/bug01-20261111T185427Z-08e19d/results.json](evidence/bug01-20261111T185427Z-08e19d/results.json)

### bug02 — preserved earlier attempt: 16 passed, 0 failed

- [evidence/bug02-20261109T143316Z-b2d8a6/concurrent-week-database.json](evidence/bug02-20261109T143316Z-b2d8a6/concurrent-week-database.json)
- [evidence/bug02-20261109T143316Z-b2d8a6/fixture-duplicate-groups.json](evidence/bug02-20261109T143316Z-b2d8a6/fixture-duplicate-groups.json)
- [evidence/bug02-20261109T143316Z-b2d8a6/fixture-identifiers.json](evidence/bug02-20261109T143316Z-b2d8a6/fixture-identifiers.json)
- [evidence/bug02-20261109T143316Z-b2d8a6/http-transcript.json](evidence/bug02-20261109T143316Z-b2d8a6/http-transcript.json)
- [evidence/bug02-20261109T143316Z-b2d8a6/m2-sessions-after.json](evidence/bug02-20261109T143316Z-b2d8a6/m2-sessions-after.json)
- [evidence/bug02-20261109T143316Z-b2d8a6/m2-sessions-before.json](evidence/bug02-20261109T143316Z-b2d8a6/m2-sessions-before.json)
- [evidence/bug02-20261109T143316Z-b2d8a6/original-database-after.json](evidence/bug02-20261109T143316Z-b2d8a6/original-database-after.json)
- [evidence/bug02-20261109T143316Z-b2d8a6/original-database-before.json](evidence/bug02-20261109T143316Z-b2d8a6/original-database-before.json)
- [evidence/bug02-20261109T143316Z-b2d8a6/results.json](evidence/bug02-20261109T143316Z-b2d8a6/results.json)

### bug02 — final selected run: 16 passed, 0 failed

- [evidence/bug02-20261111T185441Z-a45866/concurrent-week-database.json](evidence/bug02-20261111T185441Z-a45866/concurrent-week-database.json)
- [evidence/bug02-20261111T185441Z-a45866/fixture-duplicate-groups.json](evidence/bug02-20261111T185441Z-a45866/fixture-duplicate-groups.json)
- [evidence/bug02-20261111T185441Z-a45866/fixture-identifiers.json](evidence/bug02-20261111T185441Z-a45866/fixture-identifiers.json)
- [evidence/bug02-20261111T185441Z-a45866/http-transcript.json](evidence/bug02-20261111T185441Z-a45866/http-transcript.json)
- [evidence/bug02-20261111T185441Z-a45866/m2-sessions-after.json](evidence/bug02-20261111T185441Z-a45866/m2-sessions-after.json)
- [evidence/bug02-20261111T185441Z-a45866/m2-sessions-before.json](evidence/bug02-20261111T185441Z-a45866/m2-sessions-before.json)
- [evidence/bug02-20261111T185441Z-a45866/original-database-after.json](evidence/bug02-20261111T185441Z-a45866/original-database-after.json)
- [evidence/bug02-20261111T185441Z-a45866/original-database-before.json](evidence/bug02-20261111T185441Z-a45866/original-database-before.json)
- [evidence/bug02-20261111T185441Z-a45866/results.json](evidence/bug02-20261111T185441Z-a45866/results.json)

### bug03 — preserved earlier attempt: 30 passed, 1 failed

- [evidence/bug03-20261109T143821Z-3c652e/after-invalid-requests.json](evidence/bug03-20261109T143821Z-3c652e/after-invalid-requests.json)
- [evidence/bug03-20261109T143821Z-3c652e/all-fixture-attendance.json](evidence/bug03-20261109T143821Z-3c652e/all-fixture-attendance.json)
- [evidence/bug03-20261109T143821Z-3c652e/attendance-after-replay.json](evidence/bug03-20261109T143821Z-3c652e/attendance-after-replay.json)
- [evidence/bug03-20261109T143821Z-3c652e/attendance-status-absent.json](evidence/bug03-20261109T143821Z-3c652e/attendance-status-absent.json)
- [evidence/bug03-20261109T143821Z-3c652e/attendance-status-late.json](evidence/bug03-20261109T143821Z-3c652e/attendance-status-late.json)
- [evidence/bug03-20261109T143821Z-3c652e/attendance-status-leave.json](evidence/bug03-20261109T143821Z-3c652e/attendance-status-leave.json)
- [evidence/bug03-20261109T143821Z-3c652e/attendance-status-present.json](evidence/bug03-20261109T143821Z-3c652e/attendance-status-present.json)
- [evidence/bug03-20261109T143821Z-3c652e/before-invalid-requests.json](evidence/bug03-20261109T143821Z-3c652e/before-invalid-requests.json)
- [evidence/bug03-20261109T143821Z-3c652e/concurrent-attendance-database.json](evidence/bug03-20261109T143821Z-3c652e/concurrent-attendance-database.json)
- [evidence/bug03-20261109T143821Z-3c652e/duplicate-batch-final-state.json](evidence/bug03-20261109T143821Z-3c652e/duplicate-batch-final-state.json)
- [evidence/bug03-20261109T143821Z-3c652e/http-transcript.json](evidence/bug03-20261109T143821Z-3c652e/http-transcript.json)
- [evidence/bug03-20261109T143821Z-3c652e/m2-attendance-after.json](evidence/bug03-20261109T143821Z-3c652e/m2-attendance-after.json)
- [evidence/bug03-20261109T143821Z-3c652e/m2-attendance-before.json](evidence/bug03-20261109T143821Z-3c652e/m2-attendance-before.json)
- [evidence/bug03-20261109T143821Z-3c652e/original-database-after.json](evidence/bug03-20261109T143821Z-3c652e/original-database-after.json)
- [evidence/bug03-20261109T143821Z-3c652e/original-database-before.json](evidence/bug03-20261109T143821Z-3c652e/original-database-before.json)
- [evidence/bug03-20261109T143821Z-3c652e/results.json](evidence/bug03-20261109T143821Z-3c652e/results.json)

### bug03 — preserved earlier attempt: 31 passed, 0 failed

- [evidence/bug03-20261109T143925Z-d3e605/after-invalid-requests.json](evidence/bug03-20261109T143925Z-d3e605/after-invalid-requests.json)
- [evidence/bug03-20261109T143925Z-d3e605/all-fixture-attendance.json](evidence/bug03-20261109T143925Z-d3e605/all-fixture-attendance.json)
- [evidence/bug03-20261109T143925Z-d3e605/attendance-after-replay.json](evidence/bug03-20261109T143925Z-d3e605/attendance-after-replay.json)
- [evidence/bug03-20261109T143925Z-d3e605/attendance-status-absent.json](evidence/bug03-20261109T143925Z-d3e605/attendance-status-absent.json)
- [evidence/bug03-20261109T143925Z-d3e605/attendance-status-late.json](evidence/bug03-20261109T143925Z-d3e605/attendance-status-late.json)
- [evidence/bug03-20261109T143925Z-d3e605/attendance-status-leave.json](evidence/bug03-20261109T143925Z-d3e605/attendance-status-leave.json)
- [evidence/bug03-20261109T143925Z-d3e605/attendance-status-present.json](evidence/bug03-20261109T143925Z-d3e605/attendance-status-present.json)
- [evidence/bug03-20261109T143925Z-d3e605/before-invalid-requests.json](evidence/bug03-20261109T143925Z-d3e605/before-invalid-requests.json)
- [evidence/bug03-20261109T143925Z-d3e605/concurrent-attendance-database.json](evidence/bug03-20261109T143925Z-d3e605/concurrent-attendance-database.json)
- [evidence/bug03-20261109T143925Z-d3e605/duplicate-batch-final-state.json](evidence/bug03-20261109T143925Z-d3e605/duplicate-batch-final-state.json)
- [evidence/bug03-20261109T143925Z-d3e605/http-transcript.json](evidence/bug03-20261109T143925Z-d3e605/http-transcript.json)
- [evidence/bug03-20261109T143925Z-d3e605/m2-attendance-after.json](evidence/bug03-20261109T143925Z-d3e605/m2-attendance-after.json)
- [evidence/bug03-20261109T143925Z-d3e605/m2-attendance-before.json](evidence/bug03-20261109T143925Z-d3e605/m2-attendance-before.json)
- [evidence/bug03-20261109T143925Z-d3e605/original-database-after.json](evidence/bug03-20261109T143925Z-d3e605/original-database-after.json)
- [evidence/bug03-20261109T143925Z-d3e605/original-database-before.json](evidence/bug03-20261109T143925Z-d3e605/original-database-before.json)
- [evidence/bug03-20261109T143925Z-d3e605/results.json](evidence/bug03-20261109T143925Z-d3e605/results.json)

### bug03 — final selected run: 31 passed, 0 failed

- [evidence/bug03-20261111T185503Z-5469ff/after-invalid-requests.json](evidence/bug03-20261111T185503Z-5469ff/after-invalid-requests.json)
- [evidence/bug03-20261111T185503Z-5469ff/all-fixture-attendance.json](evidence/bug03-20261111T185503Z-5469ff/all-fixture-attendance.json)
- [evidence/bug03-20261111T185503Z-5469ff/attendance-after-replay.json](evidence/bug03-20261111T185503Z-5469ff/attendance-after-replay.json)
- [evidence/bug03-20261111T185503Z-5469ff/attendance-status-absent.json](evidence/bug03-20261111T185503Z-5469ff/attendance-status-absent.json)
- [evidence/bug03-20261111T185503Z-5469ff/attendance-status-late.json](evidence/bug03-20261111T185503Z-5469ff/attendance-status-late.json)
- [evidence/bug03-20261111T185503Z-5469ff/attendance-status-leave.json](evidence/bug03-20261111T185503Z-5469ff/attendance-status-leave.json)
- [evidence/bug03-20261111T185503Z-5469ff/attendance-status-present.json](evidence/bug03-20261111T185503Z-5469ff/attendance-status-present.json)
- [evidence/bug03-20261111T185503Z-5469ff/before-invalid-requests.json](evidence/bug03-20261111T185503Z-5469ff/before-invalid-requests.json)
- [evidence/bug03-20261111T185503Z-5469ff/concurrent-attendance-database.json](evidence/bug03-20261111T185503Z-5469ff/concurrent-attendance-database.json)
- [evidence/bug03-20261111T185503Z-5469ff/duplicate-batch-final-state.json](evidence/bug03-20261111T185503Z-5469ff/duplicate-batch-final-state.json)
- [evidence/bug03-20261111T185503Z-5469ff/http-transcript.json](evidence/bug03-20261111T185503Z-5469ff/http-transcript.json)
- [evidence/bug03-20261111T185503Z-5469ff/m2-attendance-after.json](evidence/bug03-20261111T185503Z-5469ff/m2-attendance-after.json)
- [evidence/bug03-20261111T185503Z-5469ff/m2-attendance-before.json](evidence/bug03-20261111T185503Z-5469ff/m2-attendance-before.json)
- [evidence/bug03-20261111T185503Z-5469ff/original-database-after.json](evidence/bug03-20261111T185503Z-5469ff/original-database-after.json)
- [evidence/bug03-20261111T185503Z-5469ff/original-database-before.json](evidence/bug03-20261111T185503Z-5469ff/original-database-before.json)
- [evidence/bug03-20261111T185503Z-5469ff/results.json](evidence/bug03-20261111T185503Z-5469ff/results.json)

### regression — preserved earlier attempt: 16 passed, 0 failed

- [evidence/regression-20261109T143858Z-a22497/http-transcript.json](evidence/regression-20261109T143858Z-a22497/http-transcript.json)
- [evidence/regression-20261109T143858Z-a22497/original-database-after.json](evidence/regression-20261109T143858Z-a22497/original-database-after.json)
- [evidence/regression-20261109T143858Z-a22497/original-database-before.json](evidence/regression-20261109T143858Z-a22497/original-database-before.json)
- [evidence/regression-20261109T143858Z-a22497/reenrollment-database.json](evidence/regression-20261109T143858Z-a22497/reenrollment-database.json)
- [evidence/regression-20261109T143858Z-a22497/results.json](evidence/regression-20261109T143858Z-a22497/results.json)
- [evidence/regression-20261109T143858Z-a22497/withdrawal-database.json](evidence/regression-20261109T143858Z-a22497/withdrawal-database.json)

### regression — final selected run: 16 passed, 0 failed

- [evidence/regression-20261111T185537Z-4c25ea/http-transcript.json](evidence/regression-20261111T185537Z-4c25ea/http-transcript.json)
- [evidence/regression-20261111T185537Z-4c25ea/original-database-after.json](evidence/regression-20261111T185537Z-4c25ea/original-database-after.json)
- [evidence/regression-20261111T185537Z-4c25ea/original-database-before.json](evidence/regression-20261111T185537Z-4c25ea/original-database-before.json)
- [evidence/regression-20261111T185537Z-4c25ea/reenrollment-database.json](evidence/regression-20261111T185537Z-4c25ea/reenrollment-database.json)
- [evidence/regression-20261111T185537Z-4c25ea/results.json](evidence/regression-20261111T185537Z-4c25ea/results.json)
- [evidence/regression-20261111T185537Z-4c25ea/withdrawal-database.json](evidence/regression-20261111T185537Z-4c25ea/withdrawal-database.json)

## Environment, preservation and authenticity

- [Initial Git state](evidence/initial-git-state.json)
- [Verified isolated backend](evidence/environment-verification.json)
- [Recorded failed startup attempt](evidence/bug02-startup-attempt-failed.json)
- [M2 and pre-existing file preservation receipt](evidence/preservation-verification.json)
- [Privacy scan receipt](evidence/privacy-scan.json)
- [All-file SHA-256 manifest](evidence/integrity-manifest.json)
- [Surefire totals and per-test names/outcomes](evidence/maven/surefire-summary.json)

The final three receipts and sanitized Maven artifacts are emitted by `tools/package_evidence.py` after these reports. The manifest covers every packaged file except itself; the ZIP is CRC- and SHA-256-checked. Raw logs and pre-existing change backups stay private in `.milestone3/`.

- [evidence/original-database-before-launch-20261109T142806Z.json](evidence/original-database-before-launch-20261109T142806Z.json)
- [evidence/original-database-before-launch-20261109T142818Z.json](evidence/original-database-before-launch-20261109T142818Z.json)
- [evidence/original-database-before-launch-20261109T143126Z.json](evidence/original-database-before-launch-20261109T143126Z.json)
- [evidence/original-database-before-launch-20261109T143245Z.json](evidence/original-database-before-launch-20261109T143245Z.json)
- [evidence/original-database-before-launch-20261109T143705Z.json](evidence/original-database-before-launch-20261109T143705Z.json)
- [evidence/original-database-before-launch-20261111T185407Z.json](evidence/original-database-before-launch-20261111T185407Z.json)

## Maven evidence

- [evidence/maven/bug01-maven-retry.log](evidence/maven/bug01-maven-retry.log)
- [evidence/maven/bug01-maven.log](evidence/maven/bug01-maven.log)
- [evidence/maven/bug02-final-maven.log](evidence/maven/bug02-final-maven.log)
- [evidence/maven/bug02-maven.log](evidence/maven/bug02-maven.log)
- [evidence/maven/bug03-maven.log](evidence/maven/bug03-maven.log)
- [evidence/maven/full-suite-maven.log](evidence/maven/full-suite-maven.log)
- [evidence/maven/resume-bug01-maven.log](evidence/maven/resume-bug01-maven.log)
- [evidence/maven/resume-bug02-maven.log](evidence/maven/resume-bug02-maven.log)
- [evidence/maven/resume-bug03-maven.log](evidence/maven/resume-bug03-maven.log)
- [evidence/maven/resume-full-suite-maven.log](evidence/maven/resume-full-suite-maven.log)
- [evidence/maven/TEST-io.khadijah.smartcoursehub.AttendanceRegressionTest.xml](evidence/maven/TEST-io.khadijah.smartcoursehub.AttendanceRegressionTest.xml)
- [evidence/maven/TEST-io.khadijah.smartcoursehub.AuthSecurityRegressionTest.xml](evidence/maven/TEST-io.khadijah.smartcoursehub.AuthSecurityRegressionTest.xml)
- [evidence/maven/TEST-io.khadijah.smartcoursehub.SmartCourseHubApplicationTests.xml](evidence/maven/TEST-io.khadijah.smartcoursehub.SmartCourseHubApplicationTests.xml)
- [evidence/maven/TEST-io.khadijah.smartcoursehub.WeeklySessionRegressionTest.xml](evidence/maven/TEST-io.khadijah.smartcoursehub.WeeklySessionRegressionTest.xml)

## Authentic screenshots

After screenshots are actual browser captures of sanitized recorded JSON evidence, not application UI screenshots. The underlying JSON and capture provenance remain the evidence source; M2 PNGs are separately labelled rendered excerpts.

- [evidence/screenshots/bug01-20261111T185427Z-08e19d-authorized-ADMIN-persistence.png](evidence/screenshots/bug01-20261111T185427Z-08e19d-authorized-ADMIN-persistence.png)
- [evidence/screenshots/bug01-20261111T185427Z-08e19d-authorized-INSTRUCTOR-persistence.png](evidence/screenshots/bug01-20261111T185427Z-08e19d-authorized-INSTRUCTOR-persistence.png)
- [evidence/screenshots/bug01-20261111T185427Z-08e19d-public-0-ADMIN-persistence.png](evidence/screenshots/bug01-20261111T185427Z-08e19d-public-0-ADMIN-persistence.png)
- [evidence/screenshots/bug01-20261111T185427Z-08e19d-public-1-admin-persistence.png](evidence/screenshots/bug01-20261111T185427Z-08e19d-public-1-admin-persistence.png)
- [evidence/screenshots/bug01-20261111T185427Z-08e19d-public-2-AdMiN-persistence.png](evidence/screenshots/bug01-20261111T185427Z-08e19d-public-2-AdMiN-persistence.png)
- [evidence/screenshots/bug01-20261111T185427Z-08e19d-public-3-INSTRUCTOR-persistence.png](evidence/screenshots/bug01-20261111T185427Z-08e19d-public-3-INSTRUCTOR-persistence.png)
- [evidence/screenshots/bug01-20261111T185427Z-08e19d-public-4-instructor-persistence.png](evidence/screenshots/bug01-20261111T185427Z-08e19d-public-4-instructor-persistence.png)
- [evidence/screenshots/bug01-20261111T185427Z-08e19d-public-5-UNKNOWN-persistence.png](evidence/screenshots/bug01-20261111T185427Z-08e19d-public-5-UNKNOWN-persistence.png)
- [evidence/screenshots/bug01-20261111T185427Z-08e19d-results.png](evidence/screenshots/bug01-20261111T185427Z-08e19d-results.png)
- [evidence/screenshots/bug02-20261111T185441Z-a45866-concurrent-week-database.png](evidence/screenshots/bug02-20261111T185441Z-a45866-concurrent-week-database.png)
- [evidence/screenshots/bug02-20261111T185441Z-a45866-fixture-duplicate-groups.png](evidence/screenshots/bug02-20261111T185441Z-a45866-fixture-duplicate-groups.png)
- [evidence/screenshots/bug02-20261111T185441Z-a45866-results.png](evidence/screenshots/bug02-20261111T185441Z-a45866-results.png)
- [evidence/screenshots/bug03-20261111T185503Z-5469ff-concurrent-attendance-database.png](evidence/screenshots/bug03-20261111T185503Z-5469ff-concurrent-attendance-database.png)
- [evidence/screenshots/bug03-20261111T185503Z-5469ff-duplicate-batch-final-state.png](evidence/screenshots/bug03-20261111T185503Z-5469ff-duplicate-batch-final-state.png)
- [evidence/screenshots/bug03-20261111T185503Z-5469ff-results.png](evidence/screenshots/bug03-20261111T185503Z-5469ff-results.png)
- [evidence/screenshots/evidence-environment-verification.png](evidence/screenshots/evidence-environment-verification.png)
- [evidence/screenshots/evidence-preservation-verification.png](evidence/screenshots/evidence-preservation-verification.png)
- [Screenshot source hashes and capture provenance](evidence/screenshots/provenance.json)
- [Browser capture tool](tools/capture_evidence.py)

## Reproduction tools

- [Isolated API/MySQL harness](tools/verify_api.py)
- [Sanitization, preservation and archive verifier](tools/package_evidence.py)

Use the harness only after compilation, with privately supplied local credentials; it refuses unidentified listener/database targets. Never run the preserved M2 assessment harness to collect M3 results.
