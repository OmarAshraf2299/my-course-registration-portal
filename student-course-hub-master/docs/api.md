# API Specification

## Base URL
```
http://localhost:8080/api
```

## Authentication Header
Protected endpoints require HTTP Bearer token:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoint Summary

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user credentials and return JWT token.
- `POST /api/auth/register` - Register a new student or instructor account.

### Administrator Endpoints (`/api/admin`) - *Requires Role ADMIN*
- `GET /api/admin/users` - List all system users.
- `POST /api/admin/users` - Create user account.
- `PUT /api/admin/users/{id}/status` - Enable or disable user account.
- `GET /api/admin/courses` - List courses catalog.
- `POST /api/admin/courses` - Create new course entry.
- `DELETE /api/admin/courses/{id}` - Delete course (if unassigned).
- `GET /api/admin/sections` - List active sections.
- `POST /api/admin/sections` - Create section schedule.

### Instructor Endpoints (`/api/instructor`) - *Requires Role INSTRUCTOR*
- `GET /api/instructor/sections` - List instructor's assigned sections.
- `GET /api/instructor/sections/{id}/students` - View section enrolled student roster.
- `POST /api/instructor/attendance` - Record attendance for class session.
- `POST /api/instructor/assignments` - Create section coursework assignment.
- `POST /api/instructor/submissions/{id}/grade` - Grade student submission.

### Student Endpoints (`/api/student`) - *Requires Role STUDENT*
- `GET /api/student/courses` - View available courses and section seats.
- `POST /api/student/enrollments` - Enroll into section.
- `GET /api/student/enrollments` - View active enrollments.
- `DELETE /api/student/enrollments/{id}` - Drop enrolled section.
- `GET /api/student/grades` - View assignment grades and feedback.
- `GET /api/student/academic-progress` - View term GPA and credit progress summary.
