# Test Results

All outcomes below are read from actual Surefire XML and recorded live JSON, rather than inferred from implementation. Long table cells are abbreviated; linked JSON contains the complete expected and actual values.

## Final Maven suite

Command from `student-course-hub-master/server`: `mvn -B -ntp test`.

| Test class | Tests | Failures | Errors | Skipped | Evidence |
|---|---:|---:|---:|---:|---|
## Preserved live test-oracle correction

The first BUG-03 live run recorded 30 PASS / 1 FAIL because the harness expected HTTP 403 for a student invoking instructor-only attendance marking. Existing method security denied it with HTTP 400 and `{success:false,message:'Access Denied'}`; the database remained unchanged. The product's existing exception-to-HTTP mapping was not altered. The harness now accepts 403 or precisely that existing 400 denial plus unchanged database evidence, not arbitrary 400 responses. A fresh complete run supplied the final passing result below. The failed assertion and its full transcript remain preserved.

- bug03: **30 passed / 1 failed**; [original attempt results](evidence/bug03-20261109T143821Z-3c652e/results.json); [original attempt transcript](evidence/bug03-20261109T143821Z-3c652e/http-transcript.json).

| AttendanceRegressionTest | 12 | 0 | 0 | 0 | [AttendanceRegressionTest XML](evidence/maven/TEST-io.khadijah.smartcoursehub.AttendanceRegressionTest.xml) |
| AuthSecurityRegressionTest | 11 | 0 | 0 | 0 | [AuthSecurityRegressionTest XML](evidence/maven/TEST-io.khadijah.smartcoursehub.AuthSecurityRegressionTest.xml) |
| SmartCourseHubApplicationTests | 1 | 0 | 0 | 0 | [SmartCourseHubApplicationTests XML](evidence/maven/TEST-io.khadijah.smartcoursehub.SmartCourseHubApplicationTests.xml) |
| WeeklySessionRegressionTest | 6 | 0 | 0 | 0 | [WeeklySessionRegressionTest XML](evidence/maven/TEST-io.khadijah.smartcoursehub.WeeklySessionRegressionTest.xml) |
| **Total** | **30** | **0** | **0** | **0** | [Per-test result names and outcomes](evidence/maven/surefire-summary.json) |

[Sanitized final Maven log](evidence/maven/resume-full-suite-maven.log). H2 test isolation uses create/drop only on the in-memory test schema; API/MySQL verification uses the isolated existing test schema with schema updates disabled.

## Focused runs and attempt history

| Stage | Command | Actual result / evidence |
|---|---|---|
| BUG-01 focused | `mvn -B -ntp -Dtest=AuthSecurityRegressionTest test` | 11 passed after correcting the test-only nonexistent route; [passing log](evidence/maven/bug01-maven-retry.log). |
| Initial auth test attempt | Same focused command | 11 executed, 1 failure: the new test requested nonexistent `/api/courses`; corrected to `/api/student/sections/available`. [Original failed log, sanitized](evidence/maven/bug01-maven.log). This is not a reproduced application defect. |
| BUG-02 plus auth regression | `mvn -B -ntp -Dtest=WeeklySessionRegressionTest,AuthSecurityRegressionTest test` | 17 passed; [log](evidence/maven/bug02-maven.log). |
| BUG-02 final focused rerun | `mvn -B -ntp -Dtest=WeeklySessionRegressionTest test` | 6 passed after making a test assertion independent of unspecified repository ordering; [log](evidence/maven/bug02-final-maven.log). |
| BUG-03 plus earlier-fix regression | `mvn -B -ntp -Dtest=AttendanceRegressionTest,AuthSecurityRegressionTest,WeeklySessionRegressionTest test` | 12 attendance tests plus 17 earlier-fix tests passed (29 total); [log](evidence/maven/bug03-maven.log). |
| Backend environment retries | Explicit isolated launcher; verify PID/URL/pool before testing | Two environmental startup attempts required retry. One failed while compiled classes changed during launch: [recorded startup attempt](evidence/bug02-startup-attempt-failed.json). No defect API execution was accepted on failed starts. Final [environment verification](evidence/environment-verification.json) passed. |

## BUG-01 live API and database checks

Completed `2026-11-11T18:54:35.164980+00:00` in `smartcoursehub_m2_test`: **25 passed, 0 failed**. HTTP requests/responses are sanitized, including passwords/tokens. SQL is read-only and captures fixture counts/IDs/statuses and duplicate groups.

| Case | Expected | Actual | Result |
|---|---|---|---|
| anonymous-admin-denied | `401 or 403` | `403` | PASS |
| public-ADMIN-rejected | `400` | `400` | PASS |
| public-ADMIN-not-persisted | `0 rows` | `[{"n":"0"}]` | PASS |
| public-admin-rejected | `400` | `400` | PASS |
| public-admin-not-persisted | `0 rows` | `[{"n":"0"}]` | PASS |
| public-AdMiN-rejected | `400` | `400` | PASS |
| public-AdMiN-not-persisted | `0 rows` | `[{"n":"0"}]` | PASS |
| public-INSTRUCTOR-rejected | `400` | `400` | PASS |
| public-INSTRUCTOR-not-persisted | `0 rows` | `[{"n":"0"}]` | PASS |
| public-instructor-rejected | `400` | `400` | PASS |
| public-instructor-not-persisted | `0 rows` | `[{"n":"0"}]` | PASS |
| public-UNKNOWN-rejected | `400` | `400` | PASS |
| public-UNKNOWN-not-persisted | `0 rows` | `[{"n":"0"}]` | PASS |
| student-role | `STUDENT` | `STUDENT` | PASS |
| student-login | `same registered ID` | `50` | PASS |
| student-admin-denied | `403` | `403` | PASS |
| wrong-password-rejected | `400 or 401` | `400` | PASS |
| existing-admin-access | `200` | `200` | PASS |
| provisioned-ADMIN-login | `correct role and created ID` | `{"role":"ADMIN","userId":51}` | PASS |
| authorized-ADMIN-persisted | `enabled ADMIN` | `[{"id":"51","role":"ADMIN","enabled":"1"}]` | PASS |
| provisioned-ADMIN-authorization | `200` | `200` | PASS |
| provisioned-INSTRUCTOR-login | `correct role and created ID` | `{"role":"INSTRUCTOR","userId":52}` | PASS |
| authorized-INSTRUCTOR-persisted | `enabled INSTRUCTOR` | `[{"id":"52","role":"INSTRUCTOR","enabled":"1"}]` | PASS |
| provisioned-INSTRUCTOR-authorization | `403` | `403` | PASS |
| original-database-preserved | `All table fingerprints unchanged` | `true` | PASS |

Full, unabridged expected/actual values: [evidence/bug01-20261111T185427Z-08e19d/results.json](evidence/bug01-20261111T185427Z-08e19d/results.json).

[HTTP transcript](evidence/bug01-20261111T185427Z-08e19d/http-transcript.json); [original database before](evidence/bug01-20261111T185427Z-08e19d/original-database-before.json); [original database after](evidence/bug01-20261111T185427Z-08e19d/original-database-after.json).

## BUG-02 live API and database checks

Completed `2026-11-11T18:54:46.853832+00:00` in `smartcoursehub_m2_test`: **16 passed, 0 failed**. HTTP requests/responses are sanitized, including passwords/tokens. SQL is read-only and captures fixture counts/IDs/statuses and duplicate groups.

| Case | Expected | Actual | Result |
|---|---|---|---|
| initial-empty | `0 rows` | `0` | PASS |
| initial-two | `2 distinct session IDs` | `[20,21]` | PASS |
| repeat-same-ids | `[20,21]` | `[20,21]` | PASS |
| repeat-two-rows | `2 rows` | `2` | PASS |
| next-week-new-ids | `new IDs` | `[22,23]` | PASS |
| next-week-four-rows | `4 rows` | `4` | PASS |
| overlap-preserves-existing-id | `[21]` | `[21]` | PASS |
| overlap-adds-only-missing | `5 rows` | `5` | PASS |
| concurrent-all-success | `4 HTTP 200 responses` | `[200,200,200,200]` | PASS |
| concurrent-same-ids | `same 2 IDs in all responses` | `[[25,26],[25,26],[25,26],[25,26]]` | PASS |
| concurrent-two-persisted | `2 rows` | `[{"id":"25","section_id":"143","session_date":"2026-11-23","start_time":"09:00:00.000000"},{"id":"26","section_id":"143","session_date":"2026-11-25","start_time":"09:00:00.000000"}]` | PASS |
| no-new-duplicate-groups | `0 duplicate groups` | `[]` | PASS |
| missing-section-404 | `404` | `404` | PASS |
| invalid-date-400 | `400` | `400` | PASS |
| m2-session-rows-preserved | `[{"id":"1","section_id":"137","session_date":"2026-11-09","start_time":"09:00:00.000000","duration_minutes":"90","created_by_teacher_id":"32"},{"id":"2","section_id":"137","session_date":"2026-11-11","start_time":"09:00:00.0000...` | `[{"id":"1","section_id":"137","session_date":"2026-11-09","start_time":"09:00:00.000000","duration_minutes":"90","created_by_teacher_id":"32"},{"id":"2","section_id":"137","session_date":"2026-11-11","start_time":"09:00:00.0000...` | PASS |
| original-database-preserved | `All table fingerprints unchanged` | `true` | PASS |

Full, unabridged expected/actual values: [evidence/bug02-20261111T185441Z-a45866/results.json](evidence/bug02-20261111T185441Z-a45866/results.json).

[HTTP transcript](evidence/bug02-20261111T185441Z-a45866/http-transcript.json); [original database before](evidence/bug02-20261111T185441Z-a45866/original-database-before.json); [original database after](evidence/bug02-20261111T185441Z-a45866/original-database-after.json).

## BUG-03 live API and database checks

Completed `2026-11-11T18:55:13.725129+00:00` in `smartcoursehub_m2_test`: **31 passed, 0 failed**. HTTP requests/responses are sanitized, including passwords/tokens. SQL is read-only and captures fixture counts/IDs/statuses and duplicate groups.

| Case | Expected | Actual | Result |
|---|---|---|---|
| student-login | `same registered ID` | `55` | PASS |
| initial-empty | `0 rows` | `0` | PASS |
| first-one-row | `1 row` | `1` | PASS |
| repeat-one-same-id | `{"count":1,"id":7}` | `{"count":1,"ids":[7]}` | PASS |
| status-PRESENT-updates-same-row | `{"count":1,"id":7,"status":"PRESENT"}` | `[{"id":"7","session_id":"27","student_id":"55","status":"PRESENT"}]` | PASS |
| summary-PRESENT | `{"totalClasses":1,"presentCount":1,"absentCount":0,"attendancePercentage":100.0}` | `{"totalClasses":1,"presentCount":1,"absentCount":0,"attendancePercentage":100.0}` | PASS |
| status-ABSENT-updates-same-row | `{"count":1,"id":7,"status":"ABSENT"}` | `[{"id":"7","session_id":"27","student_id":"55","status":"ABSENT"}]` | PASS |
| summary-ABSENT | `{"totalClasses":1,"presentCount":0,"absentCount":1,"attendancePercentage":0.0}` | `{"totalClasses":1,"presentCount":0,"absentCount":1,"attendancePercentage":0.0}` | PASS |
| status-LATE-updates-same-row | `{"count":1,"id":7,"status":"LATE"}` | `[{"id":"7","session_id":"27","student_id":"55","status":"LATE"}]` | PASS |
| summary-LATE | `{"totalClasses":1,"presentCount":1,"absentCount":0,"attendancePercentage":100.0}` | `{"totalClasses":1,"presentCount":1,"absentCount":0,"attendancePercentage":100.0}` | PASS |
| status-LEAVE-updates-same-row | `{"count":1,"id":7,"status":"LEAVE"}` | `[{"id":"7","session_id":"27","student_id":"55","status":"LEAVE"}]` | PASS |
| summary-LEAVE | `{"totalClasses":1,"presentCount":0,"absentCount":1,"attendancePercentage":0.0}` | `{"totalClasses":1,"presentCount":0,"absentCount":1,"attendancePercentage":0.0}` | PASS |
| duplicate-batch-one-final-status | `same one row, final explicit PRESENT` | `[{"id":"7","session_id":"27","student_id":"55","status":"PRESENT"}]` | PASS |
| concurrent-all-success | `4 HTTP 200 responses` | `[200,200,200,200]` | PASS |
| concurrent-one-row | `1 PRESENT row` | `[{"id":"8","session_id":"28","student_id":"55","status":"PRESENT"}]` | PASS |
| invalid-status-400 | `400` | `400` | PASS |
| null-status-400 | `400` | `400` | PASS |
| null-student-400 | `400` | `400` | PASS |
| null-record-400 | `400` | `400` | PASS |
| missing-body-400 | `400` | `400` | PASS |
| unenrolled-student-400 | `400` | `400` | PASS |
| missing-student-400 | `400` | `400` | PASS |
| batch-rollback-400 | `400` | `400` | PASS |
| wrong-instructor-400 | `400` | `400` | PASS |
| missing-session-404 | `404` | `404` | PASS |
| student-marking-forbidden | `400 or 403 with success=false and Access Denied; subsequent database check unchanged` | `{"status":400,"body":{"success":false,"message":"Access Denied","data":null}}` | PASS |
| invalid-requests-preserve-record | `[{"id":"7","session_id":"27","student_id":"55","status":"PRESENT"}]` | `[{"id":"7","session_id":"27","student_id":"55","status":"PRESENT"}]` | PASS |
| invalid-requests-no-extra-records | `2 legitimate rows only` | `[{"id":"7","session_id":"27","student_id":"55","status":"PRESENT"},{"id":"8","session_id":"28","student_id":"55","status":"PRESENT"}]` | PASS |
| final-summary-two-distinct-sessions | `{"totalClasses":2,"presentCount":2,"absentCount":0,"attendancePercentage":100.0}` | `{"totalClasses":2,"presentCount":2,"absentCount":0,"attendancePercentage":100.0}` | PASS |
| m2-attendance-rows-preserved | `[{"id":"1","session_id":"1","student_id":"33","status":"PRESENT"},{"id":"2","session_id":"1","student_id":"33","status":"PRESENT"}]` | `[{"id":"1","session_id":"1","student_id":"33","status":"PRESENT"},{"id":"2","session_id":"1","student_id":"33","status":"PRESENT"}]` | PASS |
| original-database-preserved | `All table fingerprints unchanged` | `true` | PASS |

Full, unabridged expected/actual values: [evidence/bug03-20261111T185503Z-5469ff/results.json](evidence/bug03-20261111T185503Z-5469ff/results.json).

[HTTP transcript](evidence/bug03-20261111T185503Z-5469ff/http-transcript.json); [original database before](evidence/bug03-20261111T185503Z-5469ff/original-database-before.json); [original database after](evidence/bug03-20261111T185503Z-5469ff/original-database-after.json).

## Not executed and limits

Actual Java 17 runtime execution was Not Run; installed Java 21.0.10 compiled to the configured Java 17 target. Manual React/browser application flows were Not Run. Direct SQL constraint-enforcement testing was Not Run because no database uniqueness migration was installed. No historical cleanup was performed. Browser evidence screenshots display captured sanitized JSON and do not establish UI workflow correctness. No tests are recorded successful without actual result artifacts.


## Focused rechecks on 11 November 2026

| Test class | Passed | Log |
|---|---:|---|
| AuthSecurityRegressionTest | 11 | [log](evidence/maven/resume-bug01-maven.log) |
| WeeklySessionRegressionTest | 6 | [log](evidence/maven/resume-bug02-maven.log) |
| AttendanceRegressionTest | 12 | [log](evidence/maven/resume-bug03-maven.log) |

All three focused runs had zero failures, errors or skips. Final complete suite: 30 passed, zero failures/errors/skips.
