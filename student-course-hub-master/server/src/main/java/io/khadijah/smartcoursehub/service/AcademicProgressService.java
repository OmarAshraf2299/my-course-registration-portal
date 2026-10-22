package io.khadijah.smartcoursehub.service;

import io.khadijah.smartcoursehub.dto.AcademicProgressDTO;
import io.khadijah.smartcoursehub.dto.CourseGradeDTO;
import io.khadijah.smartcoursehub.entity.Assignments;
import io.khadijah.smartcoursehub.entity.Courses;
import io.khadijah.smartcoursehub.entity.Enrollments;
import io.khadijah.smartcoursehub.entity.Sections;
import io.khadijah.smartcoursehub.entity.Submissions;
import io.khadijah.smartcoursehub.entity.Users;
import io.khadijah.smartcoursehub.repository.AssignmentsRepository;
import io.khadijah.smartcoursehub.repository.CoursesRepository;
import io.khadijah.smartcoursehub.repository.EnrollmentsRepository;
import io.khadijah.smartcoursehub.repository.SectionsRepository;
import io.khadijah.smartcoursehub.repository.SubmissionsRepository;
import io.khadijah.smartcoursehub.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class AcademicProgressService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private EnrollmentsRepository enrollmentsRepository;

    @Autowired
    private SectionsRepository sectionsRepository;

    @Autowired
    private CoursesRepository coursesRepository;

    @Autowired
    private AssignmentsRepository assignmentsRepository;

    @Autowired
    private SubmissionsRepository submissionsRepository;

    public AcademicProgressDTO getAcademicProgress(Long studentId) {
        Users student = usersRepository.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student not found: " + studentId));

        AcademicProgressDTO progress = new AcademicProgressDTO();
        progress.setStudentId(studentId);
        progress.setStudentName(student.getName());

        List<CourseGradeDTO> courseGrades = new ArrayList<>();
        double totalGradePoints = 0;
        int totalCredits = 0;

        List<Enrollments> enrollments = enrollmentsRepository.findByStudentIdAndStatus(studentId, "ENROLLED");

        for (Enrollments enrollment : enrollments) {
            CourseGradeDTO courseGrade = calculateCourseGrade(studentId, enrollment.getSectionId());
            if (courseGrade != null) {
                courseGrades.add(courseGrade);
                totalGradePoints += courseGrade.getGradePoints() * courseGrade.getCreditHours();
                totalCredits += courseGrade.getCreditHours();
            }
        }

        progress.setCourseGrades(courseGrades);
        progress.setTotalCredits(totalCredits);
        progress.setOverallGPA(totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100.0) / 100.0 : 0.0);

        return progress;
    }

    public AcademicProgressDTO getAcademicProgressBySemester(Long studentId, String semester) {
        Users student = usersRepository.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student not found: " + studentId));

        AcademicProgressDTO progress = new AcademicProgressDTO();
        progress.setStudentId(studentId);
        progress.setStudentName(student.getName());

        List<CourseGradeDTO> courseGrades = new ArrayList<>();
        double totalGradePoints = 0;
        int totalCredits = 0;

        List<Enrollments> enrollments = enrollmentsRepository.findByStudentIdAndStatus(studentId, "ENROLLED");

        for (Enrollments enrollment : enrollments) {
            Sections section = sectionsRepository.findById(enrollment.getSectionId()).orElse(null);
            if (section != null && section.getSemester().equals(semester)) {
                CourseGradeDTO courseGrade = calculateCourseGrade(studentId, enrollment.getSectionId());
                if (courseGrade != null) {
                    courseGrades.add(courseGrade);
                    totalGradePoints += courseGrade.getGradePoints() * courseGrade.getCreditHours();
                    totalCredits += courseGrade.getCreditHours();
                }
            }
        }

        progress.setCourseGrades(courseGrades);
        progress.setTotalCredits(totalCredits);
        progress.setOverallGPA(totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100.0) / 100.0 : 0.0);

        return progress;
    }

    private CourseGradeDTO calculateCourseGrade(Long studentId, Long sectionId) {
        Sections section = sectionsRepository.findById(sectionId).orElse(null);
        if (section == null) return null;

        Courses course = coursesRepository.findById(section.getCourseId()).orElse(null);
        if (course == null) return null;

        CourseGradeDTO dto = new CourseGradeDTO();
        dto.setSectionId(sectionId);
        dto.setCourseCode(course.getCode());
        dto.setCourseTitle(course.getTitle());
        dto.setCreditHours(course.getCreditHours());
        dto.setSemester(section.getSemester());

        List<Assignments> assignments = assignmentsRepository.findBySectionId(sectionId);
        List<Long> assignmentIds = assignments.stream().map(Assignments::getId).collect(Collectors.toList());

        double totalMarksObtained = 0;
        double totalMarksPossible = 0;

        if (!assignmentIds.isEmpty()) {
            List<Submissions> submissions = submissionsRepository.findByAssignmentIdsAndStudentId(assignmentIds, studentId);

            for (Assignments assignment : assignments) {
                totalMarksPossible += assignment.getTotalMarks();

                Submissions submission = submissions.stream()
                        .filter(s -> s.getAssignmentId().equals(assignment.getId()))
                        .findFirst()
                        .orElse(null);

                if (submission != null && submission.getObtainedMarks() != null) {
                    totalMarksObtained += submission.getObtainedMarks();
                }
            }
        }

        dto.setTotalMarksObtained(totalMarksObtained);
        dto.setTotalMarksPossible(totalMarksPossible);

        double percentage = totalMarksPossible > 0 ? (totalMarksObtained / totalMarksPossible) * 100 : 0;
        dto.setPercentage(Math.round(percentage * 100.0) / 100.0);

        String letterGrade = calculateLetterGrade(percentage);
        dto.setLetterGrade(letterGrade);

        double gradePoints = calculateGradePoints(letterGrade);
        dto.setGradePoints(gradePoints);

        return dto;
    }

    private String calculateLetterGrade(double percentage) {
        if (percentage >= 90) return "A+";
        if (percentage >= 85) return "A";
        if (percentage >= 80) return "A-";
        if (percentage >= 75) return "B+";
        if (percentage >= 70) return "B";
        if (percentage >= 65) return "B-";
        if (percentage >= 60) return "C+";
        if (percentage >= 55) return "C";
        if (percentage >= 50) return "C-";
        if (percentage >= 45) return "D";
        return "F";
    }

    private double calculateGradePoints(String letterGrade) {
        switch (letterGrade) {
            case "A+": return 4.0;
            case "A": return 4.0;
            case "A-": return 3.7;
            case "B+": return 3.3;
            case "B": return 3.0;
            case "B-": return 2.7;
            case "C+": return 2.3;
            case "C": return 2.0;
            case "C-": return 1.7;
            case "D": return 1.0;
            default: return 0.0;
        }
    }
}
