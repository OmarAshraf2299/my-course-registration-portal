# UC-04 -- Enroll in Course

**Use Case ID:** UC-04  
**Use Case Name:** Enroll in Course  
**Primary Actor:** Student  
**Level:** User-goal  
**Scope:** SmartCourseHub

## 1. Brief Description

Student enrolls in a course section and gets it added to their timetable and academic records.

## 2. Stakeholders & Interests

- **Student:** Wants smooth enrollment and visibility of schedule
- **Instructor:** Needs accurate list of enrolled students
- **Institution:** Needs capacity control and correct enrollments

## 3. Preconditions

- Student is authenticated
- Enrollment period is open
- Relevant sections exist

## 4. Postconditions

- **Success:** Enrollment record (studentId, sectionId, status = ENROLLED) is created
- **Failure:** No changes, and student receives an error/explanation

## 5. Main Success Scenario

1. Student logs into the system
2. Student navigates to **"Course Catalog / Available Sections"**
3. System shows list of sections with course code, title, instructor, schedule, capacity, and seats left
4. Student selects a section and clicks **"Enroll"**
5. System checks:
   - Student not already enrolled in this section
   - Seats are available (enrolled count < capacity)
6. System creates an enrollment record with status ENROLLED
7. System updates number of occupied seats
8. System confirms that enrollment is successful
9. Student can see this section listed under **"My Courses / My Timetable"**

## 6. Alternate / Extension Flows

### 6A -- Section Full
- 5a. If capacity reached, system shows message:
  - "Section full. Please select a different section."
- 5b. No enrollment record is created

### 6B -- Already Enrolled
- 5c. If enrollment already exists, system shows:
  - "You are already enrolled in this section."
- 5d. No duplicate record

### 6C -- Drop Enrollment (Variation)
- 4a. Student goes to "My Courses"
- 4b. Student clicks **"Drop"** next to a section
- 4c. System checks if drop is allowed (within drop deadline)
- 4d. System updates enrollment status to DROPPED and frees up seat

## 7. Special Requirements

- Operations must be transactional -- no race conditions in seat counting
- Proper error messages should guide the student

## 8. Frequency of Use

- High at the beginning of semester; occasional later