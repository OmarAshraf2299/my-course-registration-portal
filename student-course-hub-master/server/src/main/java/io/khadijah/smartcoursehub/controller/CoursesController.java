package io.khadijah.smartcoursehub.controller;

import io.khadijah.smartcoursehub.dto.ApiResponse;
import io.khadijah.smartcoursehub.dto.CoursesDTO;
import io.khadijah.smartcoursehub.service.CoursesService;
import io.khadijah.smartcoursehub.vo.CoursesUpdateVO;
import io.khadijah.smartcoursehub.vo.CoursesVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/courses")
@PreAuthorize("hasRole('ADMIN')")
public class CoursesController {

    @Autowired
    private CoursesService coursesService;

    @PostMapping
    public ResponseEntity<ApiResponse<Long>> create(@Valid @RequestBody CoursesVO vO) {
        Long id = coursesService.save(vO);
        return ResponseEntity.ok(ApiResponse.success("Course created successfully", id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CoursesDTO>>> getAll() {
        List<CoursesDTO> courses = coursesService.getAll();
        return ResponseEntity.ok(ApiResponse.success(courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CoursesDTO>> getById(@PathVariable Long id) {
        CoursesDTO course = coursesService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(course));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> update(@PathVariable Long id, @Valid @RequestBody CoursesUpdateVO vO) {
        coursesService.update(id, vO);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        coursesService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
    }
}
