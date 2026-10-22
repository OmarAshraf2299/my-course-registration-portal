# UC-03 -- Offer Course Sections

**Use Case ID:** UC-03  
**Use Case Name:** Offer Course Sections  
**Primary Actor:** Admin  
**Scope:** SmartCourseHub

## 1. Brief Description

Admin creates course sections for specific semesters and assigns an instructor, room, time, and capacity.

## 2. Preconditions

- Courses exist in the catalog
- Instructors exist as users with role INSTRUCTOR

## 3. Postconditions

- **Success:** New section is defined and available for student enrollment
- **Failure:** No inconsistent or partial section data is stored

## 4. Main Success Scenario

1. Admin selects **"Section Management"**
2. System shows list of existing sections
3. Admin clicks **"Create Section"**
4. System displays a form with fields:
   - Select Course
   - Select Instructor
   - Semester (e.g., "Spring 2026")
   - Capacity
   - Room
   - Schedule (e.g., "Mon 10--12")
5. Admin fills the fields and submits
6. System validates references (course/instructor exist) and required fields
7. System saves the section in DB
8. Section appears in the list and is available in the **Student Enrollment** view

## 5. Alternate / Extension Flows

### 5A -- Invalid Capacity
- 6a. If capacity <= 0, system shows error
- 6b. Admin corrects and resubmits (back to step 6)

### 5B -- Instructor Not Available (business rule)
- 6c. System checks schedule conflicts (optional advanced rule)
- 6d. If instructor has overlapping section, warn admin:
  - Admin may cancel or override if allowed by policy

## 6. Special Requirements

- Section must reference valid Course and Instructor
- Optional: Prevent time clashes for the same instructor

## 7. Frequency of Use

- Mainly at the beginning of each semester