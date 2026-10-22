# University Attendance Management System (UAMS)
## Complete Business Rules & Requirements Specification

---

## 1. SYSTEM OVERVIEW

### 1.1 Purpose
The University Attendance Management System (UAMS) is designed to manage and track student attendance across different courses, sections, and class sessions with role-based access control.

### 1.2 User Roles
- **Admin**: Manages master data (courses, students, teachers, sections)
- **Teacher**: Creates class sessions and marks attendance
- **Student**: Views personal attendance records

### 1.3 Authentication & User Management
- Users must register/sign up before accessing the system
- Login required for all authenticated endpoints
- JWT tokens issued upon successful login
- Tokens must be included in all subsequent requests

---

## 2. CORE BUSINESS RULES

### 2.1 Course & Credit Rules
- Each 3-credit course has **exactly 2 classes per week** per section
- Credit hours determine weekly class frequency

### 2.2 Class Session Rules
- **Duration**: Each class session = 90 minutes (1.5 hours)
- **Frequency**: 2 sessions per week for 3-credit courses
- **Uniqueness**: No duplicate sessions for same section on same date/time
- **Creation**: Only assigned teachers can create sessions for their sections
- **Scheduling**: Sessions must be scheduled with valid date and time

### 2.3 Attendance Rules
- Teacher marks attendance **per session**
- Attendance can only be marked for **enrolled students**
- **No duplicate attendance**: One record per student per session
- Only the **assigned teacher** can mark attendance for their section
- Valid attendance statuses:
  - PRESENT
  - ABSENT
  - LATE
  - LEAVE

### 2.4 Enrollment Rules
- Students must be **ENROLLED** in a section to have attendance marked
- Enrollment status must be verified before attendance operations
- Enrollment links students to specific sections

### 2.6 Authentication Rules
- **Registration**: Users must provide unique username/email and strong password
- **Password Security**: Passwords must be encrypted (BCrypt recommended)
- **Role Assignment**: 
  - Students register with ROLE_STUDENT by default
  - Teachers registered by Admin with ROLE_TEACHER
  - Admin accounts created via special process/initial setup
- **Login**: Validates credentials and issues JWT token
- **Token Expiry**: JWT tokens have defined expiration time
- **Token Refresh**: System may support token refresh mechanism
- **Logout**: Client-side token removal (optional server-side blacklist)
- Each section belongs to exactly one course
- Each section is assigned to exactly one teacher
- Class sessions are linked to both section and creating teacher
- Attendance records reference both session and student

---

## 3. ENTITY RELATIONSHIPS

### 3.1 Core Entities
1. **Course**: Master course catalog
2. **Section**: Specific offering of a course (semester/year)
3. **Student**: Enrolled learners
4. **Teacher**: Faculty members
5. **ClassSession**: Individual class meetings
6. **Attendance**: Attendance records per session
7. **Enrollment**: Student-section registration

### 3.2 Key Relationships
- Course → Section (One-to-Many)
- Section → ClassSession (One-to-Many)
- Section → Enrollment (One-to-Many)
- Teacher → Section (One-to-Many, assigned teacher)
- Teacher → ClassSession (One-to-Many, creator)
- Student → Enrollment (One-to-Many)
- ClassSession → Attendance (One-to-Many)
- Student → Attendance (One-to-Many)

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Authentication & User Management

#### 4.1.1 User Registration (Sign Up)
- **Student Registration**:
  - Provide: username, email, password, full name, student ID
  - System assigns ROLE_STUDENT automatically
  - Email/username must be unique
  - Password validation (minimum 8 characters, complexity rules)
  - Account created in pending/active status

- **Teacher Registration**:
  - Admin creates teacher accounts
  - Provide: username, email, password, full name, employee ID, department
  - System assigns ROLE_TEACHER
  - Optional: Teacher self-registration with admin approval

- **Admin Registration**:
  - Initial admin created via database seeding/configuration
  - Additional admins created by existing admins
  - System assigns ROLE_ADMIN

#### 4.1.2 User Login
- **Login Process**:
  - User provides username/email and password
  - System validates credentials against database
  - Password verified using BCrypt comparison
  - On success: Generate JWT token with user details and role
  - Return token to client with expiration time
  - On failure: Return appropriate error message

- **JWT Token Structure**:
  - Contains: userId, username, role, issued time, expiration time
  - Signed with secret key
  - Typical expiration: 24 hours (configurable)

#### 4.1.3 Password Management
- **Password Reset**:
  - User requests reset via email
  - System sends reset token/link
  - User provides new password
  - Password updated with encryption

- **Change Password**:
  - Authenticated user can change password
  - Requires old password verification
  - New password encrypted and saved

#### 4.1.4 Logout
- Client discards JWT token
- Optional: Server-side token blacklist for enhanced security

### 4.2 Session Management
- **Weekly Session Generation**: Automatically create 2 sessions per week for 3-credit courses
- **Session Details**: Record date, start time, duration (90 min default), and topic
- **Authorization**: Only assigned teachers can create sessions

### 4.3 Attendance Management
- **Mark Attendance**: Teachers mark PRESENT/ABSENT/LATE/LEAVE per student per session
- **Validation**: Verify student enrollment before allowing attendance
- **Duplicate Prevention**: System prevents duplicate attendance records
- **Teacher Authorization**: Only assigned teacher (from SecurityContext) can mark

### 4.4 Attendance Reporting
- **Student View**: Students can view their own attendance records
- **Percentage Calculation**: Calculate attendance percentage per section
- **Filter by Section**: View attendance for specific sections

### 4.5 Admin Functions
- Manage courses, students, teachers
- Manage section assignments
- Oversee system-wide data

---

## 5. SECURITY REQUIREMENTS

### 5.1 Authentication
- JWT-based authentication for all users
- Secure token management and validation
- Tokens passed in Authorization header: `Bearer <token>`
- Token expiration and renewal handling
- Public endpoints: `/api/auth/signup`, `/api/auth/login`
- All other endpoints require valid JWT token

### 5.2 Role-Based Access Control

#### Admin Access
- Full access to `/api/admin/**`
- Can manage all master data
- May have read access to sections and reports

#### Teacher Access
- Access to `/api/sections/**` (for assigned sections)
- Access to `/api/sessions/**` (create and manage sessions)
- Cannot access admin functions
- Cannot access other students' personal data

#### Student Access
- Access to `/api/students/me/**` (own data only)
- View-only access to own attendance
- Cannot access admin or teacher functions

### 5.3 Authorization Rules
- SecurityContext used to verify current user identity
- Teacher assignment verified before session/attendance operations
- Students can only access their own attendance data

---

## 6. DATA VALIDATION RULES

### 6.1 User Validation
- **Registration Validation**:
  - Username: 3-50 characters, alphanumeric + underscore
  - Email: Valid email format, must be unique
  - Password: Minimum 8 characters, at least one uppercase, one lowercase, one digit
  - Full name: Required, 2-100 characters
  - Student ID / Employee ID: Required for respective roles

- **Login Validation**:
  - Username/email required
  - Password required
  - Account must be active/not suspended

### 6.2 ClassSession Validation
- Section must exist
- Date must be valid
- Start time must be specified
- Duration defaults to 90 minutes
- Topic/description recommended
- No conflicting sessions for same section

### 6.3 Attendance Validation
- Session must exist
- Student must exist
- Student must be enrolled in section
- Attendance status must be valid enum
- No duplicate records allowed

### 6.4 Enrollment Validation
- Student must exist
- Section must exist
- Status must be valid (e.g., ENROLLED, DROPPED, WITHDRAWN)

---

## 7. TECHNICAL SPECIFICATIONS

### 7.1 Backend Technology Stack
- **Framework**: Spring Boot
- **ORM**: Spring Data JPA
- **Security**: Spring Security with JWT
- **Password Encryption**: BCrypt
- **Database**: JPA-compatible (MySQL/PostgreSQL)
- **Tools**: JPA Buddy for entity generation
- **Utilities**: Lombok for boilerplate reduction
- **JWT Library**: jjwt (Java JWT) or similar

### 7.2 Frontend Technology Stack
- **Framework**: React
- **HTTP Client**: Axios
- **Routing**: React Router
- **UI Framework**: Bootstrap
- **Authentication**: JWT token management

### 7.3 API Design Principles
- RESTful architecture
- JSON request/response format
- Consistent endpoint naming
- Proper HTTP status codes
- JWT in Authorization header

---

## 8. API ENDPOINT SPECIFICATIONS

### 8.1 Authentication Endpoints
- `POST /api/auth/signup`: Register new user (student)
  - Request: `{ username, email, password, fullName, studentId }`
  - Response: `{ message, userId }` or error
- `POST /api/auth/login`: Authenticate user
  - Request: `{ username, password }`
  - Response: `{ token, role, username, expiresIn }`
- `POST /api/auth/refresh`: Refresh JWT token (optional)
  - Request: `{ refreshToken }`
  - Response: `{ token, expiresIn }`
- `POST /api/auth/logout`: Logout user (optional, client-side mainly)
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password with token

### 8.2 Session Management Endpoints
- `POST /api/sections/{id}/sessions/week`: Generate weekly sessions
- `GET /api/sections/{id}/sessions`: Retrieve all sessions for section

### 8.3 Attendance Endpoints
- `POST /api/sessions/{id}/attendance`: Mark attendance
- `GET /api/students/me/attendance?sectionId=`: Get student's attendance

### 8.4 Admin Endpoints
- `/api/admin/**`: Administrative functions (ADMIN only)

---

## 9. CALCULATION FORMULAS

### 9.1 Attendance Percentage
```
Attendance % = (Total Present Sessions / Total Conducted Sessions) × 100

Where:
- Total Present Sessions = Count of PRESENT status for student in section
- Total Conducted Sessions = Count of all sessions in section
```

### 9.2 Weekly Session Count
```
For 3-credit course: Sessions per week = 2
Total duration per week = 2 × 90 minutes = 180 minutes
```

---

## 10. WORKFLOW SCENARIOS

### 10.1 User Registration Workflow
1. User navigates to signup page
2. Fills registration form (username, email, password, name, ID)
3. Client validates input format
4. Submits POST request to `/api/auth/signup`
5. Server validates uniqueness and password strength
6. Password encrypted with BCrypt
7. User record created with ROLE_STUDENT
8. Success message returned
9. User redirected to login page

### 10.2 User Login Workflow
1. User navigates to login page
2. Enters username/email and password
3. Client submits POST request to `/api/auth/login`
4. Server retrieves user by username/email
5. BCrypt verifies password hash
6. If valid: Generate JWT token with user info and role
7. Return token and user details to client
8. Client stores token (localStorage/sessionStorage)
9. User redirected to role-specific dashboard
10. Token included in Authorization header for all subsequent requests

### 10.3 Weekly Session Creation Workflow
1. Teacher selects section
2. Specifies week start date
3. System generates 2 sessions (90 min each)
4. System validates no duplicates
5. Sessions saved with teacher as creator

### 10.4 Attendance Marking Workflow
1. Teacher opens session
2. System displays enrolled students
3. Teacher marks each student (PRESENT/ABSENT/LATE/LEAVE)
4. System validates enrollment
5. System prevents duplicate marking
6. Attendance records saved

### 10.5 Student Attendance View Workflow
1. Student logs in
2. Selects section
3. System retrieves attendance records
4. System calculates percentage
5. Display in table format

---

## 11. CONSTRAINTS & ASSUMPTIONS

### 11.1 Constraints
- Only 3-credit courses considered (2 sessions/week)
- Session duration fixed at 90 minutes
- One teacher per section
- One section per course offering (per semester)
- Password must meet complexity requirements
- JWT tokens expire after configured time (e.g., 24 hours)
- Email addresses must be unique across all users

### 11.2 Assumptions
- Academic calendar defines valid week start dates
- Teachers have access to class roster before marking
- Students enrolled before sessions begin
- JWT tokens properly managed on client side
- Users have valid email addresses for registration
- Password reset emails can be sent successfully
- Initial admin account created via seeding/manual process
- Users remember their passwords or can reset them via email

---

## 12. QUALITY REQUIREMENTS

### 12.1 Transactional Consistency
- Attendance marking operations are atomic
- Session generation ensures no partial creates
- Enrollment validation before attendance

### 12.2 Data Accuracy
- Real-time attendance updates
- Accurate percentage calculations
- Consistent date/time handling

### 12.3 Usability
- Intuitive Bootstrap UI
- Clear error messages
- Responsive design for mobile access

---

## 13. ERROR HANDLING

### 13.1 Common Error Scenarios
- Student not enrolled in section
- Duplicate attendance attempt
- Unauthorized access attempt
- Invalid session date/time
- Conflicting session schedule
- **Authentication Errors**:
  - Invalid username/password
  - Expired JWT token
  - Missing Authorization header
  - Token signature verification failed
- **Registration Errors**:
  - Username/email already exists
  - Weak password
  - Invalid email format
  - Missing required fields

### 13.2 Error Responses
- Appropriate HTTP status codes:
  - 200: Success
  - 201: Created (successful registration)
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (invalid credentials, expired token)
  - 403: Forbidden (insufficient permissions)
  - 404: Not Found (resource doesn't exist)
  - 409: Conflict (duplicate username/email)
  - 500: Internal Server Error
- Descriptive error messages
- Validation feedback to user
- Security: Don't reveal whether username or password was incorrect (use generic "Invalid credentials")