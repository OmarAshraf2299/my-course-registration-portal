# Student Course Hub

> A full-stack university academic & course management platform built with Spring Boot 3, Spring Security (JWT), and React.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)

---

## 1. Visual Demo & Screenshots

### 🛠️ Administrator Management Portal
![Administrator Portal Dashboard](assets/images/admin_dashboard.jpg)

### 👩‍🏫 Instructor Section & Attendance Portal
![Instructor Attendance Portal](assets/images/instructor_attendance.jpg)

### 🎓 Student Academic Progress & GPA Dashboard
![Student Academic Progress Dashboard](assets/images/student_progress.jpg)

---

## 2. Overview & Motivation

**Student Course Hub** (SmartCourseHub) solves critical operational bottlenecks in university academic workflows by integrating user access control, section scheduling, attendance logging, coursework grading, and academic progress tracking into a single unified system.

Key motivations:
- **Role-Based Workflows:** Streamlines permissions for Administrators, Faculty Members, and Enrolled Students.
- **Data Integrity & Automation:** Automated CSV seeding for initial courses and sections, with JPA relational guards protecting against orphaned schedules.
- **Real-Time Grade & GPA Computation:** Provides instant academic progress calculation for students across semester terms.

---

## 3. Features

### 🔐 Authentication & Access Control
- **Stateless JWT Sessions:** Bearer token authentication signed via HMAC-SHA.
- **Role-Based Authorization:** Fine-grained endpoint and client route security (`ADMIN`, `INSTRUCTOR`, `STUDENT`).

### 🛠️ Administrator Portal
- **User Directory:** Full CRUD operations and instant account enable/disable toggle.
- **Course Catalog Management:** Manage course titles, codes, and credit hours.
- **Section Allocation:** Schedule term sections, set student capacity limits, and assign rooms.

### 👩‍🏫 Instructor Portal
- **Roster & Section Views:** Inspect enrolled student lists per section.
- **Session Attendance:** Mark attendance status (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
- **Assignment & Submission Grading:** Create section assignments, review student submissions, and record numeric scores with feedback.

### 🎓 Student Portal
- **Course Enrollment:** Real-time seat availability check with duplicate enrollment prevention.
- **My Academic Schedule:** Manage active enrollments and drop courses within add/drop periods.
- **Academic Progress & GPA:** Automatic calculation of term GPA, total credits earned, and degree progress.

---

## 4. Tech Stack

- **Backend:** Java 17, Spring Boot 3.4.1, Spring Security 6.x, Spring Data JPA, Hibernate, MySQL, JJWT (`0.11.5`), Apache Commons CSV.
- **Frontend:** React 19, React Router DOM v7, Axios, Bootstrap 5, React-Bootstrap.
- **Architecture:** Monorepo architecture (`/client` frontend + `/server` backend).

---

## 5. Architecture Overview

```
                                  ┌──────────────────────────┐
                                  │      React SPA           │
                                  │    (React Router v7)     │
                                  └────────────┬─────────────┘
                                               │
                                      HTTP REST (JWT Auth)
                                               │
                                  ┌────────────▼─────────────┐
                                  │    Spring Boot Backend   │
                                  └────────────┬─────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               │                               │                               │
    ┌──────────▼──────────┐         ┌──────────▼──────────┐         ┌──────────▼──────────┐
    │   Spring Security   │         │   Spring Data JPA   │         │ CSV DataInitializer │
    │     (JwtFilter)     │         │     (Hibernate)     │         │ (Courses_Processed) │
    └─────────────────────┘         └──────────┬──────────┘         └─────────────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │ MySQL / H2 Database │
                                    └─────────────────────┘
```

For detailed architectural specifications, see [`docs/architecture.md`](docs/architecture.md) and [`docs/api.md`](docs/api.md).

---

## 6. Installation & Setup

### Prerequisites
- **JDK:** Java 17 or higher
- **Node.js:** Node v18+ and npm
- **Database:** MySQL 8.0+ running on port 3306

### Step 1: Environment Configuration
Copy `.env.example` to set up environment variables:
```bash
cp .env.example .env
```

### Step 2: Backend Setup
```bash
cd server
./mvnw clean package
./mvnw spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### Step 3: Frontend Setup
```bash
cd client
npm install
npm start
```
*Frontend runs on `http://localhost:3000`*

---

## 7. Usage & Default Credentials

Upon startup, the system seeds a default system administrator account and loads initial course data:

- **Admin Login:** `admin@smartcoursehub.com` / `admin123`
- **Seeded Instructors:** Loaded automatically with default password `password123`

---

## 8. Documentation

- 📐 [Architecture Overview](docs/architecture.md)
- 🔌 [API Specification](docs/api.md)
- 🛠️ [Installation & Setup Guide](docs/setup.md)
- 📖 [User & Workflows Guide](docs/usage.md)
- 💻 [Developer & Contribution Guide](docs/development.md)
- 💡 [Architecture Decisions (ADRs)](docs/decisions.md)

---

## 9. Roadmap

- [x] Initial Monorepo Restructuring (`/client`, `/server`)
- [x] Spring Boot 3 & Security Hardening
- [ ] Automated Integration & E2E Test Suite
- [ ] Docker & Docker Compose Containerization
- [ ] OpenAPI / Swagger API Documentation UI

---

## 10. License

This project is licensed under the [MIT License](LICENSE).
