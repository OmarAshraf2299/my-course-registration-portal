# Student Course Hub - Backend Service

The core REST API backend service for **Student Course Hub**, built with Java 17, Spring Boot 3.4.1, Spring Security (JWT), and Spring Data JPA with MySQL.

## Features
- **Stateless JWT Security:** Token authentication and role-based endpoint security (`ADMIN`, `INSTRUCTOR`, `STUDENT`).
- **Relational Domain Services:** Entities and repositories for Users, Courses, Sections, Enrollments, Attendance, Assignments, and Submissions.
- **Auto Data Seeding:** Automatic ingestion of initial course catalog data from `Courses_Processed.csv`.

## Local Setup

### 1. Prerequisites
- Java 17+ JDK
- MySQL 8.0+ running on port 3306 with database `smartcoursehub_db`

### 2. Environment Configuration
Copy root `.env.example` or set environment variables:
```bash
export DB_URL="jdbc:mysql://localhost:3306/smartcoursehub_db?createDatabaseIfNotExist=true"
export DB_USERNAME="root"
export DB_PASSWORD="your_password"
```

### 3. Build & Run
```bash
./mvnw clean package
./mvnw spring-boot:run
```
The REST API server will start on `http://localhost:8080`.
