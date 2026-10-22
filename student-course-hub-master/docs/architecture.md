# Architecture Overview

## System Context & Architecture

Student Course Hub is built as a decoupled monorepo system containing a Spring Boot REST API backend (`/server`) and a React Single Page Application (`/client`).

```
                              ┌─────────────────────────────────────────┐
                              │            React Frontend               │
                              │   (React Router, Axios, Bootstrap)      │
                              └────────────────────┬────────────────────┘
                                                   │
                                            HTTP / JSON (JWT)
                                                   │
                              ┌────────────────────▼────────────────────┐
                              │           Spring Boot Backend           │
                              │  (/api/auth, /api/admin, /api/student)  │
                              └────────────────────┬────────────────────┘
                                                   │
                   ┌───────────────────────────────┼───────────────────────────────┐
                   │                               │                               │
        ┌──────────▼──────────┐         ┌──────────▼──────────┐         ┌──────────▼──────────┐
        │   Spring Security   │         │   Spring Data JPA   │         │ CSV DataInitializer │
        │     (JwtFilter)     │         │     (Hibernate)     │         │ (Courses_Processed) │
        └─────────────────────┘         └──────────┬──────────┘         └─────────────────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │  MySQL / H2 Database│
                                        │ (smartcoursehub_db) │
                                        └─────────────────────┘
```

## Security & Authentication Flow

1. Client sends POST request to `/api/auth/login` with credentials.
2. `AuthService` validates password using BCrypt and generates a signed JWT bearer token via `JwtUtil`.
3. Client stores token in `localStorage` and includes it in `Authorization: Bearer <token>` HTTP headers.
4. `JwtFilter` intercepts incoming requests, verifies token signatures, and sets `SecurityContextHolder` authentication.

## Domain Model & Data Schema

- `Users`: Stores user accounts with role designations (`ADMIN`, `INSTRUCTOR`, `STUDENT`) and enable/disable flags.
- `Courses`: Course metadata including unique code, title, description, and credit hours.
- `Sections`: Term offerings linked to a course and assigned instructor, capacity limit, and schedule.
- `Enrollments`: Student course enrollments with status (`ENROLLED`, `DROPPED`).
- `Attendance`: Student session attendance records (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
- `Assignments` & `Submissions`: Section coursework items and student grade submissions.
