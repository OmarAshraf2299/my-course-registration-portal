# UML Diagrams

The original SRS document contains the following UML diagrams:

## 2.1 Use Case Diagram (High Level)
*[PlantUML diagram showing system actors and their interactions]*

## 2.2 Class Diagram (Core Domain)
*[PlantUML diagram showing entity relationships]*

## 2.3 Sequence Diagram -- UC-04 Enroll in Course
*[PlantUML diagram showing the enrollment flow sequence]*

## 2.4 Activity Diagram -- Manage Assignment & Grades (Instructor)
*[PlantUML diagram showing the assignment management workflow]*

---

**Note:** The diagrams are included as images in the original DOCX file. To recreate them, you can use PlantUML or other UML tools based on the use cases and class structure defined in this documentation.

### Key Entities for Class Diagram:
- User (with Role)
- Course
- Section
- Enrollment
- Assignment
- Submission
- Attendance

### Key Relationships:
- User → Enrollment (Student enrolls)
- User → Section (Instructor teaches)
- Course → Section (Course has multiple sections)
- Section → Enrollment (Section has enrolled students)
- Section → Assignment (Section has assignments)
- Enrollment → Submission (Student submits assignments)