# BUG-03 ? Duplicate attendance records

Severity: High. Priority: P1.

## Original defect and reproduction

On baseline `47429f43bc5fc6a718191b1fb2516cd69d3b2934`, authenticate as the assigned instructor, enroll a synthetic student, generate a class session and POST the same `[{"studentId": <id>, "status": "PRESENT"}]` twice to `/api/sessions/{id}/attendance`. Both calls returned 200. M2 API counts were 0 ? 1 ? 2; attendance IDs 1 and 2 shared session 1/student 33. The student summary reported two classes for one distinct recorded session. See [original report](evidence/before/BUG-03_Evidence.md) and [original SQL](evidence/before/bug-03-database.json).

## Exact root cause and correction

`AttendanceService.markAttendance()` always constructed and saved a new Attendance entity and ignored existing pair lookup methods. No database pair uniqueness constraint existed. Summary queries counted raw rows, amplifying the duplicate-write defect.

The service now holds a database PESSIMISTIC_WRITE session lock until transaction completion, validates the request, then looks up all matching session/student rows. A new pair inserts one row. Repeated marking updates the same record. Duplicate entries in a batch also reuse that row; the last explicit status in the submitted batch applies. Concurrent calls serialize even when no attendance exists yet. Invalid batches roll back atomically. Unenrolled students now receive a validation error instead of a misleading successful response from silently skipping them.

Summary totals count each recorded session once. PRESENT/LATE count present; ABSENT/LEAVE count absent, preserving existing definitions and the recorded-session denominator. Identical legacy duplicate statuses contribute one session. Conflicting historical statuses cause an explicit error requesting instructor re-marking; there are no audit timestamps to justify inventing a winner. An explicit instructor re-mark updates all matching legacy rows to the requested status while retaining their IDs. Individual raw attendance lists continue to expose historical rows for review.

Changed files (relative to `student-course-hub-master/server`):

- `src/main/java/io/khadijah/smartcoursehub/service/AttendanceService.java`
- `src/main/java/io/khadijah/smartcoursehub/repository/ClassSessionRepository.java`
- `src/main/java/io/khadijah/smartcoursehub/repository/AttendanceRepository.java`
- `src/test/java/io/khadijah/smartcoursehub/AttendanceRegressionTest.java`

## Expected behavior and validation

Replaying a mark must not increase the pair's row count. A status change must update the existing ID and summary. Concurrent first marking and duplicate batch entries must not create duplicates. Missing sessions, wrong instructors, unenrolled students and malformed records must not persist attendance. A failed batch must not partially update existing attendance.

Focused verification on 11 November 2026: `mvn -B -ntp -Dtest=AttendanceRegressionTest test` passed 12 tests, zero failures/errors/skips. Live API/MySQL verification passed 31 checks with zero failures; see [results](evidence/bug03-20261111T185503Z-5469ff/results.json) and the accompanying HTTP/SQL captures. Original database fingerprints and M2 attendance rows remained unchanged. Status: Fixed and Verified (application behavior).

Commands, expected/actual outcomes, live HTTP/SQL evidence and final status are recorded in [test results](Test_Results.md), [regression results](Regression_Test_Results.md), and the [maintenance log](Updated_Maintenance_Log.md).

## Data safety and remaining historical data

No migration, data deletion or hidden cleanup was performed. Existing M2 attendance rows remain unchanged. The new writer maintains one row for previously clean pairs; existing physical duplicates require an approved reconciliation before a global uniqueness constraint can be installed. Database locks cover every current application attendance writer, including multiple application instances. Direct SQL and future writers bypassing these locks are outside that guarantee. This report verifies the corrective application behavior, not a historical database cleanup.

Commit: see [Git commit ledger](Git_Commits.md).
