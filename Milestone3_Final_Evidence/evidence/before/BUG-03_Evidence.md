# Standalone defect evidence

### BUG-03 — Duplicate attendance records

**Execution:** confirmed on 8 November 2026 using synthetic fixtures in `smartcoursehub_m2_test`.
**Evidence status:** observed defect, unchanged implementation. Severity/priority and fixes below are assessment recommendations, not implemented changes.

**Affected source:** `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/controller/AttendanceController.java:44–61,80–85`; `service/AttendanceService.java:78–109,134–153`; `repository/AttendanceRepository.java:25–33`; `entity/Attendance.java:18–38`. Client interfaces: `client/src/api/axiosClient.js:86–87`, `client/src/pages/instructor/SectionDetailPage.js:85–101`. Excerpts SRC-04, SRC-05, SRC-07, SRC-09, SRC-13, SRC-18.

**Root cause (code inspection):** after checking instructor ownership and enrollment, `markAttendance()` constructs a new Attendance object for every input record and saves it (100–107). It never calls the existing `findBySessionIdAndStudentId`/`existsBySessionIdAndStudentId` repository methods (25–27). Neither the entity mapping nor actual schema enforces session/student uniqueness. Summary queries count attendance rows, so duplicates also inflate totals.

**Preconditions:** student 33 actively enrolled in section 137 (enrollment 1); session 1 belongs to that section; authenticate as its assigned instructor 32.

**Exact reproduction:** GET `/api/sessions/1/attendance` (0 rows); POST to the same endpoint with this body; GET; repeat exactly the same POST; GET again.

```json
[
  {
    "studentId": 33,
    "status": "PRESENT"
  }
]
```

Both POST responses are HTTP **200**, with the same response body:

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": null
}
```

| Real GET observation | HTTP | Count | Attendance IDs |
|---|---|---|---|
| Before marking, event 14 | 200 | 0 | none |
| After first mark, event 16 | 200 | 1 | 1 |
| After replay, event 18 | 200 | 2 | 1,2 |

**Database evidence:** baseline SQL-derived global `attendance` count was 0; final count was 2. The actual post-replay query and result are:

```sql
SELECT session_id, student_id, COUNT(*) AS duplicate_count, GROUP_CONCAT(id ORDER BY id) AS ids FROM attendance WHERE session_id=1 AND student_id=33 GROUP BY session_id, student_id HAVING COUNT(*) > 1
```

```json
[
  {
    "session_id": "1",
    "student_id": "33",
    "duplicate_count": "2",
    "ids": "1,2"
  }
]
```

The immediate before/intermediate states are real GET responses; separate pre-write per-fixture SQL was not captured. Student summary `GET /api/student/attendance/summary`, using the student token, returned HTTP **200** and:

```json
[
  {
    "sectionId": 137,
    "courseCode": "M2-20261108T135939Z-4b2a49",
    "courseTitle": "M2 Synthetic Assessment Course",
    "totalClasses": 2,
    "presentCount": 2,
    "absentCount": 0,
    "attendancePercentage": 100.0
  }
]
```

**Expected:** one attendance record per session/student; repeat marking should update the agreed record or reject a duplicate without increasing row count.
**Actual:** the same PRESENT submission creates IDs 1 and 2 for session 1/student 33; summary reports two classes and two present records for one distinct recorded session.

**Assessment:** High severity; P1 priority. Rationale: corruption of academic attendance records and observed inflation of summary totals. No grade/payment effects were tested or asserted.

**Recommended future fix:** define repeat-marking semantics, update/upsert the existing pair transactionally, and enforce a unique `(session_id, student_id)` database constraint. Resolve existing conflicts with an approved data-retention policy before migration; the current entity lacks audit timestamps, so do not assume a reliable 'latest status wins' rule from timestamps that do not exist. Test duplicate entries inside one batch and concurrent requests. No implementation/data cleanup was performed in M2.

**Impact:** attendance marking/retrieval/summary services, instructor UI and student summary API; `attendance`, `class_sessions`, `enrollments`, `users`, indirectly section/course summaries. Risks: losing legitimate historical intent, unique-index creation failing on duplicates, altered summary semantics. Regression: identical replay leaves one row; changed status follows approved update rule; duplicate batch entries cannot create duplicates; concurrent submissions serialize safely; instructor ownership/enrollment checks remain enforced; student summary totals remain consistent. Post-fix and negative ownership cases are **Not Run**.

**Evidence:** transcript events 14–19; `bug-03-database.json`; final summary response; constraint query; E04.
