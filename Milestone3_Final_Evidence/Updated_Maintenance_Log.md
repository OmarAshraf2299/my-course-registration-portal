# Updated Maintenance Request Log

Status applies to corrected application behavior and the tests listed. Historical data reconciliation and actual Java 17 runtime testing are separate outstanding limitations.

## BUG-01 — Unauthorized administrator registration

| Field | Recorded value |
|---|---|
| Bug ID | BUG-01 |
| Description / original behavior | Anonymous ADMIN registration returned 200, persisted an enabled ADMIN and issued a token that accessed an administrator API with 200. |
| Root cause | AuthService.register trusted the public caller's role, accepted ADMIN/INSTRUCTOR, and signed that privileged role into a JWT. |
| Changed files | `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/service/AuthService.java`<br>`student-course-hub-master/server/src/test/java/io/khadijah/smartcoursehub/AuthSecurityRegressionTest.java` |
| Severity | Critical |
| Priority | P0 |
| Fix description | Restrict public registration to case-insensitive STUDENT and persist canonical STUDENT; retain protected administrator provisioning and existing login. |
| Test results | 11 focused automated tests passed; 25 live API/MySQL checks passed, 0 failed. Full suite: 30 passed. [Live expected/actual evidence](evidence/bug01-20261111T185427Z-08e19d/results.json). |
| Status | Fixed and Verified — application corrective behavior; historical physical duplicate rows remain preserved where applicable. |
| Git commit SHA | `a3896ac2d988be1d517a93f829536ba86ee4bc7d` |
| Defect report | [BUG01_Report.md](BUG01_Report.md) |

## BUG-02 — Duplicate weekly class sessions

| Field | Recorded value |
|---|---|
| Bug ID | BUG-02 |
| Description / original behavior | Repeated weekly generation increased session rows 0 to 2 to 4 for the same section/date/start time. |
| Root cause | createSessionIfNotExists unconditionally inserted; no natural-key uniqueness constraint or serialization prevented duplicate generation. |
| Changed files | `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/repository/ClassSessionRepository.java`<br>`student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/repository/SectionsRepository.java`<br>`student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/service/AttendanceService.java`<br>`student-course-hub-master/server/src/test/java/io/khadijah/smartcoursehub/WeeklySessionRegressionTest.java` |
| Severity | Medium |
| Priority | P1 |
| Fix description | Hold a database write lock on the section, look up section/date/start time, reuse the stable existing row and insert only missing sessions. |
| Test results | 6 focused automated tests passed; 16 live API/MySQL checks passed, 0 failed. Full suite: 30 passed. [Live expected/actual evidence](evidence/bug02-20261111T185441Z-a45866/results.json). |
| Status | Fixed and Verified — application corrective behavior; historical physical duplicate rows remain preserved where applicable. |
| Git commit SHA | `b65aba91b009674896258756d36927878937c392` |
| Defect report | [BUG02_Report.md](BUG02_Report.md) |

## BUG-03 — Duplicate attendance records

| Field | Recorded value |
|---|---|
| Bug ID | BUG-03 |
| Description / original behavior | Repeated PRESENT marking increased the same student/session pair 0 to 1 to 2 rows; the summary reported two classes for one recorded session. |
| Root cause | markAttendance always inserted a new entity; summaries counted raw rows and no pair uniqueness or serialized upsert existed. |
| Changed files | `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/repository/AttendanceRepository.java`<br>`student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/repository/ClassSessionRepository.java`<br>`student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/service/AttendanceService.java`<br>`student-course-hub-master/server/src/test/java/io/khadijah/smartcoursehub/AttendanceRegressionTest.java` |
| Severity | High |
| Priority | P1 |
| Fix description | Lock the session, validate and upsert attendance atomically; update existing status/IDs, deduplicate identical historical statuses in summaries, and require explicit instructor re-mark for conflicts. |
| Test results | 12 focused automated tests passed; 31 live API/MySQL checks passed, 0 failed. Full suite: 30 passed. [Live expected/actual evidence](evidence/bug03-20261111T185503Z-5469ff/results.json). |
| Status | Fixed and Verified — application corrective behavior; historical physical duplicate rows remain preserved where applicable. |
| Git commit SHA | `699739ac8cb89ab54a289972d27df73b969760f6` |
| Defect report | [BUG03_Report.md](BUG03_Report.md) |

No destructive migration or historical-row removal occurred. Admin-provisioned instructor onboarding remains available. Direct SQL is outside application-lock guarantees. Original database and M2 evidence preservation are verified by linked evidence receipts.


## Other requests retained from Milestone 2

| Request | Description | Milestone 3 status |
|---|---|---|
| MR-04 | Supported runtime/environment compatibility | Deferred; no corrective implementation claimed |
| MR-05 | Course discovery and availability feedback | Deferred |
| MR-06 | Consolidated enrollment eligibility/capacity policy | Deferred |
| MR-07 | Full-section waiting list | Deferred to Milestone 5; not implemented |
