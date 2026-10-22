package io.khadijah.smartcoursehub.controller;

import io.khadijah.smartcoursehub.dto.ApiResponse;
import io.khadijah.smartcoursehub.dto.EnrollmentsDTO;
import io.khadijah.smartcoursehub.dto.SectionsDTO;
import io.khadijah.smartcoursehub.service.EnrollmentsService;
import io.khadijah.smartcoursehub.service.SectionsService;
import io.khadijah.smartcoursehub.vo.EnrollmentsVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class EnrollmentsController {

    @Autowired
    private EnrollmentsService enrollmentsService;

    @Autowired
    private SectionsService sectionsService;

    @GetMapping("/sections/available")
    public ResponseEntity<ApiResponse<List<SectionsDTO>>> getAvailableSections() {
        List<SectionsDTO> sections = sectionsService.getAll();
        return ResponseEntity.ok(ApiResponse.success(sections));
    }

    @PostMapping("/enrollments")
    public ResponseEntity<ApiResponse<Long>> enroll(@Valid @RequestBody EnrollmentsVO vO, HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        Long id = enrollmentsService.enroll(studentId, vO.getSectionId());
        return ResponseEntity.ok(ApiResponse.success("Enrollment successful", id));
    }

    @GetMapping("/enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentsDTO>>> getMyEnrollments(HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        List<EnrollmentsDTO> enrollments = enrollmentsService.getActiveByStudentId(studentId);
        return ResponseEntity.ok(ApiResponse.success(enrollments));
    }

    @GetMapping("/enrollments/all")
    public ResponseEntity<ApiResponse<List<EnrollmentsDTO>>> getAllMyEnrollments(HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        List<EnrollmentsDTO> enrollments = enrollmentsService.getByStudentId(studentId);
        return ResponseEntity.ok(ApiResponse.success(enrollments));
    }

    @PostMapping("/enrollments/{id}/drop")
    public ResponseEntity<ApiResponse<Void>> drop(@PathVariable Long id, HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        enrollmentsService.drop(studentId, id);
        return ResponseEntity.ok(ApiResponse.success("Course dropped successfully", null));
    }
}
