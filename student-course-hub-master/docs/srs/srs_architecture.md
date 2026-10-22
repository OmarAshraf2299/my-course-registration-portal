# Architecture & Package Structure

## Backend Package Structure

```
com.smartcoursehub
├─ SmartCourseHubApplication.java
├─ config
│  ├─ SecurityConfig.java
│  └─ JwtFilter.java
├─ auth
│  ├─ AuthController.java
│  ├─ AuthService.java
│  └─ JwtUtil.java
├─ user
│  ├─ User.java
│  ├─ Role.java
│  ├─ UserRepository.java
│  └─ UserService.java
├─ course
│  ├─ Course.java
│  ├─ CourseRepository.java
│  ├─ CourseService.java
│  └─ CourseController.java
├─ section
│  ├─ Section.java
│  ├─ SectionRepository.java
│  └─ SectionController.java
├─ enrollment
│  ├─ Enrollment.java
│  ├─ EnrollmentRepository.java
│  └─ EnrollmentController.java
└─ assignment
   ├─ Assignment.java
   ├─ Submission.java
   ├─ AssignmentRepository.java
   ├─ SubmissionRepository.java
   └─ AssignmentController.java
```

## Frontend Folder Structure

```
smartcoursehub-frontend/
├─ src/
│  ├─ api/
│  │  └─ axiosClient.js
│  ├─ components/
│  │  ├─ Navbar.js
│  │  └─ ProtectedRoute.js
│  ├─ pages/
│  │  ├─ LoginPage.js
│  │  ├─ AdminDashboard.js
│  │  ├─ CourseListPage.js
│  │  ├─ StudentDashboard.js
│  │  └─ InstructorDashboard.js
│  ├─ App.js
│  └─ index.js
└─ package.json
```

## Frontend Dependencies (package.json)

```json
{
  "name": "smartcoursehub-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "axios": "^1.7.0",
    "bootstrap": "^5.3.0",
    "react": "^18.3.0",
    "react-bootstrap": "^2.10.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0"
  }
}
```