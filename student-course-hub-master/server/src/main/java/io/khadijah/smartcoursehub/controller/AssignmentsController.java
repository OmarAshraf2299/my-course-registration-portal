package io.khadijah.smartcoursehub.controller;

import io.khadijah.smartcoursehub.dto.ApiResponse;
import io.khadijah.smartcoursehub.dto.AssignmentsDTO;
import io.khadijah.smartcoursehub.dto.SubmissionsDTO;
import io.khadijah.smartcoursehub.service.AssignmentsService;
import io.khadijah.smartcoursehub.vo.AssignmentsUpdateVO;
import io.khadijah.smartcoursehub.vo.AssignmentsVO;
import io.khadijah.smartcoursehub.vo.GradesVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AssignmentsController {

    @Autowired
    private AssignmentsService assignmentsService;

    // Instructor endpoints
    @PostMapping("/api/instructor/assignments")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Long>> create(@Valid @RequestBody AssignmentsVO vO, HttpServletRequest request) {
        Long instructorId = (Long) request.getAttribute("userId");
        Long id = assignmentsService.save(instructorId, vO);
        return ResponseEntity.ok(ApiResponse.success("Assignment created successfully", id));
    }

    @PutMapping("/api/instructor/assignments/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> update(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentsUpdateVO vO,
            HttpServletRequest request) {
        Long instructorId = (Long) request.getAttribute("userId");
        assignmentsService.update(instructorId, id, vO);
        return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully", null));
    }

    @DeleteMapping("/api/instructor/assignments/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, HttpServletRequest request) {
        Long instructorId = (Long) request.getAttribute("userId");
        assignmentsService.delete(instructorId, id);
        return ResponseEntity.ok(ApiResponse.success("Assignment deleted successfully", null));
    }

    @GetMapping("/api/instructor/assignments")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<AssignmentsDTO>>> getMyAssignments(HttpServletRequest request) {
        Long instructorId = (Long) request.getAttribute("userId");
        List<AssignmentsDTO> assignments = assignmentsService.getByInstructorId(instructorId);
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    @GetMapping("/api/instructor/sections/{sectionId}/assignments")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<AssignmentsDTO>>> getSectionAssignments(@PathVariable Long sectionId) {
        List<AssignmentsDTO> assignments = assignmentsService.getBySectionId(sectionId);
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    @GetMapping("/api/instructor/assignments/{id}/submissions")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<SubmissionsDTO>>> getSubmissions(@PathVariable Long id) {
        List<SubmissionsDTO> submissions = assignmentsService.getSubmissionsByAssignment(id);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    @PostMapping("/api/instructor/grades")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> recordGrades(@Valid @RequestBody GradesVO vO, HttpServletRequest request) {
        Long instructorId = (Long) request.getAttribute("userId");
        assignmentsService.recordGrades(instructorId, vO);
        return ResponseEntity.ok(ApiResponse.success("Grades recorded successfully", null));
    }

    // Student endpoints
    @GetMapping("/api/student/assignments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AssignmentsDTO>>> getStudentAssignments(HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        List<AssignmentsDTO> assignments = assignmentsService.getByStudentId(studentId);
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    @GetMapping("/api/student/grades")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<SubmissionsDTO>>> getStudentGrades(HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        List<SubmissionsDTO> grades = assignmentsService.getStudentGrades(studentId);
        return ResponseEntity.ok(ApiResponse.success(grades));
    }
}
