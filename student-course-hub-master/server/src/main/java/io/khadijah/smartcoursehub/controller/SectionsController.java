package io.khadijah.smartcoursehub.controller;

import io.khadijah.smartcoursehub.dto.ApiResponse;
import io.khadijah.smartcoursehub.dto.SectionsDTO;
import io.khadijah.smartcoursehub.service.SectionsService;
import io.khadijah.smartcoursehub.vo.SectionsUpdateVO;
import io.khadijah.smartcoursehub.vo.SectionsVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sections")
@PreAuthorize("hasRole('ADMIN')")
public class SectionsController {

    @Autowired
    private SectionsService sectionsService;

    @PostMapping
    public ResponseEntity<ApiResponse<Long>> create(@Valid @RequestBody SectionsVO vO) {
        Long id = sectionsService.save(vO);
        return ResponseEntity.ok(ApiResponse.success("Section created successfully", id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SectionsDTO>>> getAll() {
        List<SectionsDTO> sections = sectionsService.getAll();
        return ResponseEntity.ok(ApiResponse.success(sections));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SectionsDTO>> getById(@PathVariable Long id) {
        SectionsDTO section = sectionsService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(section));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<SectionsDTO>>> getByCourse(@PathVariable Long courseId) {
        List<SectionsDTO> sections = sectionsService.getByCourseId(courseId);
        return ResponseEntity.ok(ApiResponse.success(sections));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<ApiResponse<List<SectionsDTO>>> getByInstructor(@PathVariable Long instructorId) {
        List<SectionsDTO> sections = sectionsService.getByInstructorId(instructorId);
        return ResponseEntity.ok(ApiResponse.success(sections));
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<ApiResponse<List<SectionsDTO>>> getBySemester(@PathVariable String semester) {
        List<SectionsDTO> sections = sectionsService.getBySemester(semester);
        return ResponseEntity.ok(ApiResponse.success(sections));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> update(@PathVariable Long id, @Valid @RequestBody SectionsUpdateVO vO) {
        sectionsService.update(id, vO);
        return ResponseEntity.ok(ApiResponse.success("Section updated successfully", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        sectionsService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Section deleted successfully", null));
    }
}
