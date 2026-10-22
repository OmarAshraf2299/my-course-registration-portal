# UC-02 -- Manage Courses

**Use Case ID:** UC-02  
**Use Case Name:** Manage Courses  
**Primary Actor:** Admin  
**Level:** User-goal  
**Scope:** SmartCourseHub

## 1. Brief Description

Admin maintains the course catalog by creating, editing, and removing courses.

## 2. Stakeholders & Interests

- **Admin:** Needs up-to-date course catalog
- **Instructors/Students:** Depend on correct course definitions

## 3. Preconditions

- Admin is logged in with proper role

## 4. Postconditions

- **Success:** Course is stored/updated/removed properly
- **Failure:** No unintended changes to existing course data

## 5. Main Success Scenario

1. Admin opens **"Course Management"**
2. System shows list of existing courses
3. Admin clicks **"Add Course"**
4. System shows form: code, title, description, creditHours
5. Admin enters required details and submits
6. System validates course code uniqueness and required fields
7. System saves the new course in the database
8. System displays confirmation and updated course list

## 6. Alternate / Extension Flows

### 6A -- Edit Course
- 3a. Admin clicks **"Edit"** on a course
- 3b. System shows existing values for editing
- 3c. Admin updates data and submits
- 3d. System validates and updates record

### 6B -- Delete Course (Not used in any section)
- 3e. Admin clicks **"Delete"** next to a course
- 3f. System checks if course is linked to any section
- 3g. If no sections use it, system deletes and confirms

### 6C -- Cannot Delete (In Use)
- 3h. If course is referenced by one or more sections, system shows message **"Course is in use and cannot be deleted"**

## 7. Special Requirements

- Course code must be unique
- Course delete operation must be protected to avoid data inconsistencies

## 8. Frequency of Use

- Low to moderate (start of each academic year/semester)