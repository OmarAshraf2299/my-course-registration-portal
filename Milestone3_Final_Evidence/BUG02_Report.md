# BUG-02 ? Duplicate weekly class sessions

Severity: Medium. Priority: P1.

## Original defect and reproduction

On baseline `47429f43bc5fc6a718191b1fb2516cd69d3b2934`, log in as an instructor and POST `/api/sections/{sectionId}/sessions/week?startDate=2026-11-09` twice for the same section. The original M2 observed dates are in [original report](evidence/before/BUG-02_Evidence.md). Two calls created four rows instead of two: counts 0 ? 2 ? 4. MySQL showed duplicate section/date/start-time groups with IDs 1,3 and 2,4. See [original SQL](evidence/before/bug-02-database.json).

## Exact root cause and correction

`AttendanceService.createSessionIfNotExists()` unconditionally built and saved a new entity. The schema had no natural-key uniqueness constraint. A plain existence check alone would still race when concurrent calls observe an empty week.

Generation now holds a database PESSIMISTIC_WRITE lock on the existing section row for the transaction, then looks up `(sectionId, sessionDate, startTime)`. It reuses an existing session or inserts only the missing one. Concurrent application instances using this service serialize on the same parent row. The default two days, 09:00 time and 90-minute duration remain unchanged for new sessions.

The earliest existing ID is a stable representative when historical duplicate sessions already exist; this does not infer attendance status or merge/delete records. Existing duration/topic/teacher and dependent attendance remain preserved.

Changed files (relative to `student-course-hub-master/server`):

- `src/main/java/io/khadijah/smartcoursehub/service/AttendanceService.java`
- `src/main/java/io/khadijah/smartcoursehub/repository/SectionsRepository.java`
- `src/main/java/io/khadijah/smartcoursehub/repository/ClassSessionRepository.java`
- `src/test/java/io/khadijah/smartcoursehub/WeeklySessionRegressionTest.java`

## Expected behavior and validation

Initial generation creates two rows; replay returns the same IDs and creates none. Another week creates two new sessions. An overlapping/partially existing week inserts only missing times. Concurrent calls create one pair. Invalid/missing section requests must not insert rows.

Focused plus BUG-01 regression: `mvn -B -ntp -Dtest=WeeklySessionRegressionTest,AuthSecurityRegressionTest test`: 17 passed, zero failures/errors/skips. The six weekly tests cover initial generation, repeat/another week, partial week/different start time/metadata, historical duplicates, synchronized four-way concurrency and missing section. A final focused rerun follows a test assertion change to avoid relying on unspecified repository ordering.

Final focused rerun: six passed, zero failures/errors/skips. Live API/MySQL verification passed all 16 checks. [Live results](evidence/bug02-20261109T143316Z-b2d8a6/results.json) confirm counts 0 ? 2 ? 2, reused IDs, another/overlapping week, four-way concurrent generation without new duplicates, invalid requests and original M2 rows preserved. Status: Fixed and Verified (application generation). Test evidence includes HTTP responses, SQL row counts/duplicate-group queries and legacy row preservation.

## Data safety and limits

No migration, data deletion or cleanup was performed. Existing duplicate M2 sessions remain visible and are not counted as repaired historical data. This prevents new duplicates through all current application writers; direct SQL or future writers bypassing the lock can still violate uniqueness. A database constraint on already-duplicated historical data requires an approved reconciliation plan before migration.

Commit: see [Git commit ledger](Git_Commits.md).
