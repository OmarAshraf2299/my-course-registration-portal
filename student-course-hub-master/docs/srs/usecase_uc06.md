# UC-06 -- Manage Assignments & Grades

**Use Case ID:** UC-06  
**Use Case Name:** Manage Assignments & Grades  
**Primary Actor:** Instructor  
**Scope:** SmartCourseHub

## 1. Brief Description

Instructor creates assignments for a section and records grades for student submissions.

## 2. Preconditions

- Instructor is logged in
- Instructor is assigned to at least one section

## 3. Postconditions

- **Success:** Assignments and grades are stored and visible to students
- **Failure:** System does not save incomplete or inconsistent data

## 4. Main Success Scenario

### Assignment Creation Flow:

1. Instructor opens **"My Sections"** and selects a section
2. Instructor navigates to **"Assignments"**
3. System displays list of existing assignments for that section
4. Instructor clicks **"Create Assignment"**
5. System displays form with fields: title, description, totalMarks, deadline
6. Instructor enters data and submits
7. System validates fields (totalMarks > 0, deadline >= today)
8. System saves the new assignment in the DB and updates the list

### Grading Flow:

9. Instructor clicks on an assignment to view student submissions or enrollment list
10. System shows each student and fields for entering obtainedMarks
11. Instructor enters marks and submits
12. System validates marks (0 ≤ obtainedMarks ≤ totalMarks) and saves
13. Students can see their marks in their **"My Grades / My Courses"** view

## 5. Alternate / Extension Flows

### 5A -- Edit Assignment
- 4a. Instructor clicks **"Edit"** on an assignment
- 4b. System loads existing data
- 4c. Instructor updates and saves; system persists changes

### 5B -- Late Submission (optional business rule)
- 10a. If system tracks submission time and it is after deadline, system may flag record as LATE or restrict grading, depending on policy

### 5C -- Invalid Marks
- 12a. If marks are out of range, system rejects input and shows error
- 12b. Instructor corrects and resubmits

## 6. Special Requirements

- Grades should be visible only to respective student and authorized roles
- Once final exam period is over, grades may be locked from editing (business rule)

## 7. Frequency of Use

- Several times per semester per section