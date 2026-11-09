# Standalone defect evidence

### BUG-02 — Duplicate weekly class-session generation

**Execution:** confirmed on 8 November 2026 using synthetic fixtures in `smartcoursehub_m2_test`.
**Evidence status:** observed defect, unchanged implementation. Severity/priority and fixes below are assessment recommendations, not implemented changes.

**Affected source:** `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/controller/AttendanceController.java:25–41`; `service/AttendanceService.java:45–75`; `repository/ClassSessionRepository.java:9–12`; `entity/ClassSession.java:20–47`. Client interfaces: `client/src/api/axiosClient.js:84–85`, `client/src/pages/instructor/SectionDetailPage.js:47–58` under `student-course-hub-master/`. Excerpts SRC-04, SRC-05, SRC-06, SRC-08, SRC-13, SRC-18.

**Root cause (code inspection):** `generateWeeklySessions` calls `createSessionIfNotExists` twice for the start date and two days later. Despite the helper name, it never searches for an existing scheduled session; it builds and saves a new row each time (62–75). The entity and observed schema have no uniqueness constraint for the section/date/start-time tuple. Transactionality alone does not make repeated requests idempotent.

**Preconditions:** synthetic instructor 32, course 52, section 137 assigned to that instructor. The recorded fixture requests create a 10-seat section and enroll synthetic student 33. See transcript events 3–8 for exact setup bodies and statuses.

**Exact reproduction:** authenticate as instructor 32; GET `/api/sections/137/sessions` (0 rows); POST `/api/sections/137/sessions/week?startDate=2026-11-09`; GET sessions; repeat the identical POST; GET sessions again. **Request body: none** (`null` in transcript); `startDate` is a query parameter. Both generation responses are HTTP **200**, `success=true`, `message="Success"`. First response IDs **1,2**; replay IDs **3,4**.

| Real GET observation | HTTP | Count | IDs |
|---|---|---|---|
| Before generation, event 9 | 200 | 0 | none |
| After first call, event 11 | 200 | 2 | 1,2 |
| After exact replay, event 13 | 200 | 4 | 1,2,3,4 |

**Database evidence:** baseline SQL-derived global `class_sessions` count was 0; final verification count was 4. The actual post-replay grouped query was:

```sql
SELECT section_id, session_date, start_time, COUNT(*) AS duplicate_count, GROUP_CONCAT(id ORDER BY id) AS ids FROM class_sessions WHERE section_id=137 GROUP BY section_id, session_date, start_time HAVING COUNT(*) > 1
```

```json
[
  {
    "section_id": "137",
    "session_date": "2026-11-09",
    "start_time": "09:00:00.000000",
    "duplicate_count": "2",
    "ids": "1,3"
  },
  {
    "section_id": "137",
    "session_date": "2026-11-11",
    "start_time": "09:00:00.000000",
    "duplicate_count": "2",
    "ids": "2,4"
  }
]
```

The immediate before/intermediate fixture states were captured through GET, not separate per-fixture SQL snapshots. No pre-write SQL output is reconstructed.

**Expected:** the same section and scheduled date/time must not gain duplicate sessions when the weekly generation request is repeated; preserve the existing sessions or reject the duplicate request.
**Actual:** counts 0→2→4, with two persisted copies of 2026-11-09 09:00 and two of 2026-11-11 09:00 for section 137.

**Assessment:** Medium severity; P1 priority after the privilege-escalation fix. Duplicate scheduling can fragment attendance, confuse instructor/student views and distort downstream totals; downstream consequences beyond the captured duplicates are risk analysis.

**Recommended future fix:** agree the session identity (proposed section/date/start-time), implement idempotent lookup/create semantics, and enforce a database unique constraint with safe conflict handling. Before a migration, identify duplicates and preserve attendance references to canonical sessions using an approved merge policy. Review overlapping-date calls and concurrency; a read-before-save check alone is insufficient for races. No schema or data changes were made in M2.

**Impact:** instructor scheduling controller/service/repository, session DTO/entity responses, React generation caller; `class_sessions`, referencing `attendance`, `sections`, `users`. Risks: uniqueness migration fails on existing duplicates, attendance references become orphaned, overlapping weeks create inconsistent identities. Regression: exact replay remains 2 rows; overlapping week boundary respects identity; distinct section/week still creates legitimate sessions; parallel requests cannot create duplicates; generated sessions remain visible and usable for attendance. Post-fix and concurrency cases are **Not Run**.

**Evidence:** transcript events 9–13; `bug-02-database.json`; `Database_and_API_Observations.json`; constraint query; E03.
