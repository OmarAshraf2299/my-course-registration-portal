package io.khadijah.smartcoursehub.controller;

import io.khadijah.smartcoursehub.dto.AcademicProgressDTO;
import io.khadijah.smartcoursehub.dto.ApiResponse;
import io.khadijah.smartcoursehub.service.AcademicProgressService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/academic-progress")
@PreAuthorize("hasRole('STUDENT')")
public class AcademicProgressController {

    @Autowired
    private AcademicProgressService academicProgressService;

    @GetMapping
    public ResponseEntity<ApiResponse<AcademicProgressDTO>> getMyProgress(HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        AcademicProgressDTO progress = academicProgressService.getAcademicProgress(studentId);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<ApiResponse<AcademicProgressDTO>> getMyProgressBySemester(
            @PathVariable String semester, HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        AcademicProgressDTO progress = academicProgressService.getAcademicProgressBySemester(studentId, semester);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }
}
