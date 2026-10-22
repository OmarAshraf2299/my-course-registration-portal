package io.khadijah.smartcoursehub.controller;

import io.khadijah.smartcoursehub.dto.ApiResponse;
import io.khadijah.smartcoursehub.dto.EnrollmentsDTO;
import io.khadijah.smartcoursehub.dto.SectionsDTO;
import io.khadijah.smartcoursehub.service.EnrollmentsService;
import io.khadijah.smartcoursehub.service.SectionsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructor")
@PreAuthorize("hasRole('INSTRUCTOR')")
public class InstructorController {

    @Autowired
    private SectionsService sectionsService;

    @Autowired
    private EnrollmentsService enrollmentsService;

    @GetMapping("/sections")
    public ResponseEntity<ApiResponse<List<SectionsDTO>>> getMySections(HttpServletRequest request) {
        Long instructorId = (Long) request.getAttribute("userId");
        List<SectionsDTO> sections = sectionsService.getByInstructorId(instructorId);
        return ResponseEntity.ok(ApiResponse.success(sections));
    }

    @GetMapping("/sections/{sectionId}")
    public ResponseEntity<ApiResponse<SectionsDTO>> getSectionById(@PathVariable Long sectionId) {
        SectionsDTO section = sectionsService.getById(sectionId);
        return ResponseEntity.ok(ApiResponse.success(section));
    }

    @GetMapping("/sections/{sectionId}/students")
    public ResponseEntity<ApiResponse<List<EnrollmentsDTO>>> getSectionStudents(@PathVariable Long sectionId) {
        List<EnrollmentsDTO> enrollments = enrollmentsService.getEnrolledBySectionId(sectionId);
        return ResponseEntity.ok(ApiResponse.success(enrollments));
    }
}
