# 3. Functional Requirements (FR)

## FR-1 User Management

1. System shall allow admins to create, update, and deactivate users
2. Users shall be assigned roles: ADMIN, INSTRUCTOR, STUDENT
3. System shall provide login functionality with email + password
4. System shall issue a JWT token on successful authentication

## FR-2 Course Management (Admin)

1. Admin shall create a course with attributes: code, title, description, creditHours
2. Admin shall update or delete courses not yet used by any section
3. Admin shall create **Sections** with course, instructor, day/time, room, capacity

## FR-3 Enrollment (Student)

1. Student shall view the list of available sections
2. Student shall enroll in a section if:
   - They are authenticated
   - Enrollment period is open
   - Seats are available
3. System shall prevent duplicate enrollment in same section
4. Student shall view and drop their enrollments (subject to drop rules)

## FR-4 Attendance (Instructor)

1. Instructor shall view list of enrolled students for a section
2. Instructor shall mark attendance for a given date as PRESENT or ABSENT
3. Student shall be able to view own attendance per course

## FR-5 Assignments & Grades

1. Instructor shall create assignments for a section with:
   - title, description, totalMarks, deadline
2. Students shall view assignments of enrolled sections
3. Instructor shall record/modify marks per student per assignment
4. Student shall view assignment marks and course total

## FR-6 Academic Progress

1. Student shall view a **summary** of courses, grades, and GPA
2. System shall calculate per-course grade and overall GPA (simplified formula acceptable)