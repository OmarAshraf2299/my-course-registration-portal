# Regression Test Results

The final backend API regression run completed `2026-11-11T18:55:47.366038+00:00` against `smartcoursehub_m2_test`: **16 checks passed, 0 failed**. It created retained synthetic fixtures through authorized APIs. No original database changes or destructive cleanup were used.

Coverage includes student course/section browsing, enrollment, duplicate enrollment rejection, active enrollment listing, instructor roster, withdrawal, re-enrollment, authorized course/section updates, weekly generation replay, student deactivation/reactivation login controls and continued denial of student access to administrator APIs. Authentication, administrator provisioning and attendance/session edge cases are additionally covered by defect runs and the final Maven suite.

| Case | Expected | Actual | Result |
|---|---|---|---|
| student-login | `same registered ID` | `59` | PASS |
| course-browsing | `new section visible` | `145` | PASS |
| duplicate-enrollment-400 | `400` | `400` | PASS |
| enrollment-listed-active | `one active fixture enrollment` | `[{"id":7,"studentId":59,"studentName":"M3 Synthetic Student","sectionId":145,"courseCode":"M3-20261111T185537Z-4c25ea","courseTitle":"M3 Synthetic Corrective Course","instructorName":"M3 Synthetic Instructor","semester":"M3-SYN...` | PASS |
| instructor-roster | `enrolled synthetic student visible` | `[59]` | PASS |
| withdrawal-status | `DROPPED` | `[{"id":"7","student_id":"59","section_id":"145","status":"DROPPED"}]` | PASS |
| withdrawal-removes-from-active | `0 active enrollments` | `[]` | PASS |
| reenroll-reuses-id | `7` | `7` | PASS |
| reenrollment-status | `ENROLLED` | `[{"id":"7","student_id":"59","section_id":"145","status":"ENROLLED"}]` | PASS |
| admin-course-update | `updated synthetic title and 4 credit hours` | `{"title":"M3 Synthetic Updated Course","creditHours":4}` | PASS |
| admin-section-update | `M3-UPDATED room and capacity12` | `{"room":"M3-UPDATED","capacity":12}` | PASS |
| session-generation-remains-idempotent | `same two IDs` | `[[29,30],[29,30]]` | PASS |
| deactivated-login-rejected | `400 or 401` | `400` | PASS |
| reactivated-login-success | `59` | `59` | PASS |
| student-admin-still-forbidden | `403` | `403` | PASS |
| original-database-preserved | `All table fingerprints unchanged` | `true` | PASS |

Full, unabridged expected/actual values: [evidence/regression-20261111T185537Z-4c25ea/results.json](evidence/regression-20261111T185537Z-4c25ea/results.json).

Supporting evidence: [sanitized HTTP transcript](evidence/regression-20261111T185537Z-4c25ea/http-transcript.json); [original database before](evidence/regression-20261111T185537Z-4c25ea/original-database-before.json); [original database after](evidence/regression-20261111T185537Z-4c25ea/original-database-after.json). The run directory also contains SQL enrollment/withdrawal evidence.

## Automated regression

The final `mvn -B -ntp test` suite passed 30 tests, zero failures/errors/skips. Auth tests verify public-role rejection and existing login/admin provisioning; session tests exercise replay, partial/overlapping schedules, legacy preservation and concurrent generation; attendance tests cover repeated/status updates, atomic rollback, invalid inputs, instructor ownership, concurrency, student/session independence and legacy summaries/conflicts. The existing context-load test also passed. See [suite results](evidence/maven/surefire-summary.json) and [test results](Test_Results.md).

## Limits

Manual React/browser application flows and execution on an actual Java 17 runtime were Not Run. The observed runtime was Java 21.0.10 with Java 17 compilation target. Evidence-browser screenshots show recorded JSON, not exercised application UI flows. Historical duplicate rows remain preserved; no global uniqueness constraint was installed. Direct SQL/future writers bypassing application locks are outside the tested guarantee. No unrelated workflows are claimed tested.
