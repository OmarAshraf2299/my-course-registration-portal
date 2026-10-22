# UC-01 -- Manage Users

**Use Case ID:** UC-01  
**Use Case Name:** Manage Users  
**Primary Actor:** Admin  
**Level:** User-goal  
**Scope:** SmartCourseHub Web Application

## 1. Brief Description

This use case describes how an Admin creates, updates, and deactivates user accounts (students, instructors, admins) in the system.

## 2. Stakeholders and Interests

- **Admin:** Wants to register and control access for all users
- **Instructors/Students:** Need valid accounts to access system features
- **IT/Institution:** Needs controlled, secure access and proper role assignments

## 3. Preconditions

- Admin is authenticated and authorized
- System is online and connected to the database

## 4. Postconditions

- **Success:** User account is created/updated/deactivated in the database with appropriate role
- **Failure:** No changes are made to user records

## 5. Main Success Scenario (Basic Flow)

1. Admin logs into the system
2. Admin navigates to **"User Management"**
3. System displays a list of existing users
4. Admin clicks **"Create New User"**
5. System displays a form for user details: name, email, role, initial password
6. Admin fills in details and submits
7. System validates the input (unique email, required fields)
8. System saves the new user in the database with selected role
9. System confirms that the user has been created and shows updated list

## 6. Alternate / Extension Flows

### 6A -- Invalid Input
- 7a. If required fields are missing or invalid format, system displays validation errors
- 7b. Admin corrects details and resubmits (return to step 7)

### 6B -- Duplicate Email
- 7c. If email already exists, system shows **"Email already registered"**
- 7d. Admin enters a different email and resubmits (back to step 7)

### 6C -- Update User
- 4a. Instead of creating, Admin clicks **"Edit"** next to a user
- 4b. System shows an editable form
- 4c. Admin updates allowed fields and submits
- 4d. System validates and saves changes (continue at step 8)

### 6D -- Deactivate User
- 4e. Admin clicks **"Deactivate"** on a user
- 4f. System asks for confirmation
- 4g. On confirmation, system marks user as inactive (e.g., enabled = false)

## 7. Special Requirements

- Role-based authorization (only Admin can access user management)
- Password must be stored hashed
- UI must clearly show active vs inactive users

## 8. Frequency of Use

- At semester start/end, and when new users join/leave