# UC-05 -- Manage Attendance

**Use Case ID:** UC-05  
**Use Case Name:** Manage Attendance  
**Primary Actor:** Instructor  
**Scope:** SmartCourseHub

## 1. Brief Description

Instructor marks student attendance for each session and can review or update it.

## 2. Preconditions

- Instructor is logged in
- Instructor is assigned to at least one section
- Students are enrolled in the selected section

## 3. Postconditions

- **Success:** Attendance record is stored/updated for selected date
- **Failure:** No invalid or partial attendance is saved

## 4. Main Success Scenario

1. Instructor logs in and navigates to **"My Sections"**
2. Instructor selects a section
3. Instructor chooses **"Attendance"** for a given date
4. System fetches list of enrolled students for that section
5. System displays a list with each student and a control (checkbox/dropdown) to mark present/absent
6. Instructor marks each student as PRESENT or ABSENT
7. Instructor submits the attendance form
8. System validates that date and section are valid and saves attendance for each student
9. System shows confirmation and indicates attendance saved for that date

## 5. Alternate / Extension Flows

### 5A -- Update Attendance
- 3a. Instructor selects a past date for which attendance exists
- 3b. System pre-fills the current status
- 3c. Instructor modifies any entries and resubmits (continue from step 8)

### 5B -- No Enrolled Students
- 4a. If no students enrolled, system displays:
  - "No enrolled students for this section."
- 4b. Attendance submission is disabled

## 6. Special Requirements

- Attendance date should not be in the far future (basic validation)
- Students should be able to view their own attendance summary

## 7. Frequency of Use

- Once per section per class meeting