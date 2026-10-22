# UAMS Implementation Plan & Status

## Project Overview
University Attendance Management System (UAMS) for Web Engineering Final Exam.
**Date:** 23-01-2026
**Instructor:** Syed Nouman Ali

## Architecture
- **Backend:** Spring Boot (Java)
  - Location: Root
  - Structure: Controller, Service, Repository, Entity, DTO layers present.
- **Frontend:** React (Vite)
  - Location: `uams-frontend/my-react-app`

## Implementation Checklist

### SECTION A - ENTITY IMPLEMENTATION (15 Marks)
**CLO-1**
- [x] **Q1: ClassSession Entity**
  - Fields: `id`, `sessionDate`, `startTime`, `durationMinutes` (default 90), `topic`.
  - Relations: `@ManyToOne Section`, `@ManyToOne Teacher`.

### SECTION B - REPOSITORY & JPQL (10 Marks)
**CLO-1**
- [x] **Q2: Repository Interfaces**
  - `ClassSessionRepository.findBySectionId`
  - `AttendanceRecordsRepository.existsBySessionIdAndStudentId`
  - `EnrollmentsRepository.existsByStudentIdAndSectionIdAndStatus`
- [x] **Q3: JPQL Query**
  - Calculate attendance percentage for a student in a section.

### SECTION C - SERVICE LAYER & BUSINESS RULES (15 Marks)
**CLO-2**
- [x] **Q4: Weekly Class Scheduler**
  - `generateWeeklySessions(Long sectionId, LocalDate weekStartDate)`
  - Rules: 2 sessions/week for 3-credit course, 90 mins, no duplicates.
- [x] **Q5: Attendance Marking Logic**
  - `markAttendance(Long sessionId, Long studentId, AttendanceStatus status)`
  - Rules: Enrolled check, no duplicate, teacher only, save status.

### SECTION D - REST API DESIGN (10 Marks)
**CLO-3**
- [x] **Q6: Controller Endpoints**
  - `POST /api/sections/{id}/sessions/week`
  - `GET /api/sections/{id}/sessions`
  - `POST /api/sessions/{id}/attendance`
  - `GET /api/students/me/attendance`
- [x] **Q7: JSON Structures**
  - Define request bodies for generation and marking (Implemented via DTOs/Request Params).

### SECTION E - SPRING SECURITY (5 Marks)
**CLO-4**
- [x] **Q8: Role-Based Authorization**
  - Configure `SecurityFilterChain` for `ROLE_ADMIN`, `ROLE_TEACHER`, `ROLE_STUDENT`.
  - Defined access rules for `/api/admin`, `/api/sections`, `/api/sessions`, `/api/students/me`.

### SECTION F - REACT FRONTEND (15 Marks)
**CLO-4**
- [x] **Q9: React Components**
  - `TeacherAttendancePage`: Implemented with section/session selection and attendance marking.
  - `StudentAttendancePage`: Implemented with attendance list and filtering.
- [x] **Q10: Axios + JWT**
  - Integrated Axios with Basic Auth (simulating JWT for prototype as per setup).
- [x] **Q11: Protected Routing**
  - Implemented using `react-router-dom` with role-based navigation.

## Summary of Completion
- **Backend:** Fully implemented Section A-E. Fixed missing Spring Security dependency.
- **Frontend:** Fully implemented Section F using React, Vite, Axios, and Bootstrap.
- **Integration:** Configured CORS and basic authentication for seamless communication.

