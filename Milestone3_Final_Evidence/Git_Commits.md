# Git Commit Ledger

Inspected baseline: branch `master`, commit `47429f43bc5fc6a718191b1fb2516cd69d3b2934`. Corrective branch: `milestone3-corrective`. Existing modified/untracked files were preserved and excluded from these commits. No push was performed.

Each fix was tested and verified before committing and proceeding to the next defect. The three code commits are listed in implementation order. Documentation/package follow-up commits are intentionally outside this code ledger; this avoids a circular self-referencing SHA.

| Bug | Full commit SHA | Subject | Commit time |
|---|---|---|---|
| BUG-01 | `a3896ac2d988be1d517a93f829536ba86ee4bc7d` | fix(BUG-01): restrict public registration to student accounts | `2026-11-09T16:29:42+02:00` |
| BUG-02 | `b65aba91b009674896258756d36927878937c392` | fix(BUG-02): serialize and reuse weekly class session generation | `2026-11-09T16:33:35+02:00` |
| BUG-03 | `699739ac8cb89ab54a289972d27df73b969760f6` | fix(BUG-03): serialize attendance upserts and count distinct sessions | `2026-11-11T20:55:29+02:00` |

## BUG-01 committed files

- `Milestone3_Final_Evidence/BUG01_Report.md`
- `Milestone3_Final_Evidence/evidence/before/BUG-01_Evidence.md`
- `Milestone3_Final_Evidence/evidence/before/BUG-02_Evidence.md`
- `Milestone3_Final_Evidence/evidence/before/BUG-03_Evidence.md`
- `Milestone3_Final_Evidence/evidence/before/E02_BUG01.png`
- `Milestone3_Final_Evidence/evidence/before/E03_BUG02.png`
- `Milestone3_Final_Evidence/evidence/before/E04_BUG03.png`
- `Milestone3_Final_Evidence/evidence/before/bug-01-enabled-recheck.json`
- `Milestone3_Final_Evidence/evidence/before/bug-02-database.json`
- `Milestone3_Final_Evidence/evidence/before/bug-03-database.json`
- `Milestone3_Final_Evidence/evidence/before/provenance.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/authorized-ADMIN-persistence.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/authorized-INSTRUCTOR-persistence.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/http-transcript.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/original-database-after.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/original-database-before.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/public-0-ADMIN-persistence.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/public-1-admin-persistence.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/public-2-AdMiN-persistence.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/public-3-INSTRUCTOR-persistence.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/public-4-instructor-persistence.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/public-5-UNKNOWN-persistence.json`
- `Milestone3_Final_Evidence/evidence/bug01-20261109T142919Z-84aac5/results.json`
- `Milestone3_Final_Evidence/evidence/environment-verification.json`
- `Milestone3_Final_Evidence/evidence/initial-git-state.json`
- `Milestone3_Final_Evidence/evidence/original-database-before-launch-20261109T142806Z.json`
- `Milestone3_Final_Evidence/evidence/original-database-before-launch-20261109T142818Z.json`
- `Milestone3_Final_Evidence/tools/verify_api.py`
- `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/service/AuthService.java`
- `student-course-hub-master/server/src/test/java/io/khadijah/smartcoursehub/AuthSecurityRegressionTest.java`

## BUG-02 committed files

- `Milestone3_Final_Evidence/BUG02_Report.md`
- `Milestone3_Final_Evidence/evidence/bug02-20261109T143316Z-b2d8a6/concurrent-week-database.json`
- `Milestone3_Final_Evidence/evidence/bug02-20261109T143316Z-b2d8a6/fixture-duplicate-groups.json`
- `Milestone3_Final_Evidence/evidence/bug02-20261109T143316Z-b2d8a6/fixture-identifiers.json`
- `Milestone3_Final_Evidence/evidence/bug02-20261109T143316Z-b2d8a6/http-transcript.json`
- `Milestone3_Final_Evidence/evidence/bug02-20261109T143316Z-b2d8a6/m2-sessions-after.json`
- `Milestone3_Final_Evidence/evidence/bug02-20261109T143316Z-b2d8a6/m2-sessions-before.json`
- `Milestone3_Final_Evidence/evidence/bug02-20261109T143316Z-b2d8a6/original-database-after.json`
- `Milestone3_Final_Evidence/evidence/bug02-20261109T143316Z-b2d8a6/original-database-before.json`
- `Milestone3_Final_Evidence/evidence/bug02-20261109T143316Z-b2d8a6/results.json`
- `Milestone3_Final_Evidence/evidence/environment-verification.json`
- `Milestone3_Final_Evidence/tools/verify_api.py`
- `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/repository/ClassSessionRepository.java`
- `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/repository/SectionsRepository.java`
- `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/service/AttendanceService.java`
- `student-course-hub-master/server/src/test/java/io/khadijah/smartcoursehub/WeeklySessionRegressionTest.java`

## BUG-03 committed files

- `Milestone3_Final_Evidence/BUG03_Report.md`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/after-invalid-requests.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/all-fixture-attendance.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/attendance-after-replay.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/attendance-status-absent.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/attendance-status-late.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/attendance-status-leave.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/attendance-status-present.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/before-invalid-requests.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/concurrent-attendance-database.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/duplicate-batch-final-state.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/http-transcript.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/m2-attendance-after.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/m2-attendance-before.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/original-database-after.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/original-database-before.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143821Z-3c652e/results.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/after-invalid-requests.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/all-fixture-attendance.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/attendance-after-replay.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/attendance-status-absent.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/attendance-status-late.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/attendance-status-leave.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/attendance-status-present.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/before-invalid-requests.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/concurrent-attendance-database.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/duplicate-batch-final-state.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/http-transcript.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/m2-attendance-after.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/m2-attendance-before.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/original-database-after.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/original-database-before.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261109T143925Z-d3e605/results.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/after-invalid-requests.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/all-fixture-attendance.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/attendance-after-replay.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/attendance-status-absent.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/attendance-status-late.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/attendance-status-leave.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/attendance-status-present.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/before-invalid-requests.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/concurrent-attendance-database.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/duplicate-batch-final-state.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/http-transcript.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/m2-attendance-after.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/m2-attendance-before.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/original-database-after.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/original-database-before.json`
- `Milestone3_Final_Evidence/evidence/bug03-20261111T185503Z-5469ff/results.json`
- `Milestone3_Final_Evidence/tools/verify_api.py`
- `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/repository/AttendanceRepository.java`
- `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/repository/ClassSessionRepository.java`
- `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/service/AttendanceService.java`
- `student-course-hub-master/server/src/test/java/io/khadijah/smartcoursehub/AttendanceRegressionTest.java`

Reproduce locally with `git show <SHA>` or `git log --oneline milestone3-corrective`. Source corrections are in the repository; this ZIP contains the reports and supporting evidence. No credentials or private backup files are included.


## Verification resumed on 11 November 2026

At this inspection, branch `milestone3-corrective` was at `b65aba91b009674896258756d36927878937c392`, with BUG-01 and BUG-02 already committed and BUG-03 uncommitted. Current local changes were backed up privately before proceeding. The first two corrections were reviewed and reverified in order before BUG-03 was verified and committed. Original initial-state evidence remains preserved. The final runs above are from 11 November 2026.
