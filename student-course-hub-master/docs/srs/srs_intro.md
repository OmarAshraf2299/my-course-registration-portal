# 1. Introduction

## 1.1 Purpose

This SRS describes the requirements for **SmartCourseHub**, a web-based university course & enrollment management system built using **Spring Boot, Spring Data JPA, MySQL, and ReactJS**.

It is intended for:
- Developers (students)
- Course instructor
- Testers

## 1.2 Scope

SmartCourseHub provides:
- Course catalog management
- Course section offerings
- Student enrollment & timetable
- Attendance recording
- Assignment & grade management
- Academic progress / transcript views

**Technology Stack:**
- Front-end: **ReactJS**
- Back-end: **Spring Boot REST APIs**
- Database: **MySQL**

## 1.3 Definitions

- **Section**: A specific offering of a course in a semester (with time, room, instructor)
- **Enrollment**: A mapping between student and course section
- **Assignment**: A graded assessment (quiz, assignment, project, exam)