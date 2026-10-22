# Web Engineering Final Examination

| Field | Value |
|-------|-------|
| **Subject** | Web Engineering |
| **Course Code** | CSC-234 |
| **Examination** | Final Term - Fall 2025 |
| **Instructor** | Syed Nouman Ali |
| **Date** | 23-01-2026 |
| **Marks** | 60 |
| **Semester** | 7th, 5th |
| **Time** | 2 hr |

---

## Case Study: University Attendance Management System (UAMS)

### Business Rules

- Each class session duration = **90 minutes (1.5 hours)**
- Each **3-credit course has exactly 2 classes per week** per section
- Teacher marks attendance per session
- Student views own attendance
- Admin manages master data
- Role-based access using JWT

The **Relational Data Model is provided separately** (students generate entities via **JPA Buddy**).

---

## Course Learning Outcomes (CLOs)

| CLO | Description |
|-----|-------------|
| CLO-1 | Design and implement domain models using Spring Data JPA with correct entity relationships and constraints. |
| CLO-2 | Develop service layer logic enforcing business rules and transactional consistency. |
| CLO-3 | Design RESTful APIs and test them using JSON request/response patterns. |
| CLO-4 | Apply role-based security using Spring Security and integrate backend services with React frontend. |

---

## SECTION A - ENTITY IMPLEMENTATION (15 Marks)

**CLO Assessed: CLO-1**

### Q1. Implement ClassSession Entity (15 marks)

Write the complete Java entity class for ClassSession including:

- `@Entity`, `@Table`
- **Fields:**
  - id, sessionDate, startTime, durationMinutes, topic
- **Relationships:**
  - `@ManyToOne Section section`
  - `@ManyToOne Teacher createdByTeacher`
- **Default value:** durationMinutes = 90
- Lombok allowed

---

## SECTION B - REPOSITORY & JPQL (10 Marks)

**CLO Assessed: CLO-1**

### Q2. Repository Interfaces (6 marks)

Write Spring Data repository methods for:

1. **ClassSessionRepository**
   - `findBySectionId(Long sectionId)`

2. **AttendanceRepository**
   - `existsBySessionIdAndStudentId(Long sessionId, Long studentId)`

3. **EnrollmentRepository**
   - `existsByStudentIdAndSectionIdAndStatus(...)`

### Q3. JPQL Query (4 marks)

Write a JPQL query to calculate:

**Attendance percentage of a given student in a given section.**

---

## SECTION C - SERVICE LAYER & BUSINESS RULES (15 Marks)

**CLO Assessed: CLO-2**

### Q4. Weekly Class Scheduler (7 marks)

Design:

```
generateWeeklySessions(Long sectionId, LocalDate weekStartDate)
```

Must enforce:

- For 3-credit course → exactly **2 sessions per week**
- Each session = **90 minutes**
- No duplicate (section, date, time)

Provide method signature + pseudocode.

### Q5. Attendance Marking Logic (8 marks)

Design:

```
markAttendance(Long sessionId, Long studentId, AttendanceStatus status)
```

**Rules:**

- Student must be ENROLLED
- No duplicate attendance
- Only assigned teacher can mark (from SecurityContext)
- Save PRESENT / ABSENT / LATE / LEAVE

---

## SECTION D - REST API DESIGN (10 Marks)

**CLO Assessed: CLO-3**

### Q6. Controller Endpoints (6 marks)

Design REST endpoints:

1. `POST /api/sections/{id}/sessions/week`
2. `GET /api/sections/{id}/sessions`
3. `POST /api/sessions/{id}/attendance`
4. `GET /api/students/me/attendance?sectionId=`

Write mappings + method signatures.

### Q7. Postman JSON (4 marks)

Write request bodies for:

- Weekly session generation
- Attendance marking

---

## SECTION E - SPRING SECURITY (5 Marks)

**CLO Assessed: CLO-4**

### Q8. Role-Based Authorization (5 marks)

Define access rules:

| **Endpoint** | **ROLE_ADMIN** | **ROLE_TEACHER** | **ROLE_STUDENT** |
|--------------|----------------|------------------|------------------|
| `/api/admin/**` | ✔/✖ | ✔/✖ | ✔/✖ |
| `/api/sections/**` | ✔/✖ | ✔/✖ | ✔/✖ |
| `/api/sessions/**` | ✔/✖ | ✔/✖ | ✔/✖ |
| `/api/students/me/**` | ✔/✖ | ✔/✖ | ✔/✖ |

Fill allowed/denied.

---

## SECTION F - REACT FRONTEND (15 Marks)

**CLO Assessed: CLO-4**

### Q9. React Component Design (7 marks)

Design:

1. TeacherAttendancePage
2. StudentAttendancePage

Show:

- Component hierarchy
- State variables
- Props
- Bootstrap layout (table, dropdown, buttons)

### Q10. Axios + JWT Integration (4 marks)

Write React Axios code to:

- Call `GET /api/students/me/attendance`
- Pass JWT in header
- Store result in state
- Render in Bootstrap table

### Q11. Protected Routing (4 marks)

Using React Router:

- Protect `/teacher/*` for ROLE_TEACHER
- Protect `/student/*` for ROLE_STUDENT
- Redirect unauthorized users

Write route-level pseudocode.

---

## CLO-QUESTION MAPPING SUMMARY

| Section | Question | Marks | CLO |
|---------|----------|-------|-----|
| A | Q1 | 15 | CLO-1 |
| B | Q2-Q3 | 10 | CLO-1 |
| C | Q4-Q5 | 15 | CLO-2 |
| D | Q6-Q7 | 10 | CLO-3 |
| E | Q8 | 5 | CLO-4 |
| F | Q9-Q11 | 15 | CLO-4 |
| **Total** | | **60** | |