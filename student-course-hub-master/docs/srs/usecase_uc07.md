# UC-07 -- View Academic Progress

**Use Case ID:** UC-07  
**Use Case Name:** View Academic Progress  
**Primary Actor:** Student  
**Scope:** SmartCourseHub

## 1. Brief Description

Student views a summary of enrolled courses, marks, grades, and computed GPA.

## 2. Preconditions

- Student is logged in
- Student has at least one enrollment with grades, or system should handle empty state gracefully

## 3. Postconditions

- **Success:** Progress report (per course, per semester) is displayed
- **Failure:** System informs student if no data is available

## 4. Main Success Scenario

1. Student logs in and navigates to **"My Grades / Academic Progress"**
2. System retrieves student's enrollments, assignments and marks
3. System computes per-course totals and final grade (based on predefined formula)
4. System computes GPA (simple or weighted)
5. System displays:
   - List of courses with grades
   - GPA (overall and/or semester-wise)
   - Optional graph (e.g., React chart component)
6. Student reviews their academic progress

## 5. Alternate / Extension Flows

### 5A -- No Data Available
- 2a. If no enrollments or grades exist, system shows:
  - "No academic records available yet."
- 2b. Student sees an empty state message instead of error

### 5B -- Filter By Semester
- 1a. Student selects a semester filter (e.g., Spring 2026)
- 1b. System filters and displays results for that semester only

## 6. Special Requirements

- Calculation logic (how GPA and grades are derived) must be consistent and documented
- Data must be read-only for students

## 7. Frequency of Use

- Moderate to high; especially after exams or assignment grading