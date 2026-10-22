package io.khadijah.smartcoursehub.controller;

import io.khadijah.smartcoursehub.dto.ApiResponse;
import io.khadijah.smartcoursehub.dto.UsersDTO;
import io.khadijah.smartcoursehub.service.UsersService;
import io.khadijah.smartcoursehub.vo.UsersUpdateVO;
import io.khadijah.smartcoursehub.vo.UsersVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UsersController {

    @Autowired
    private UsersService usersService;

    @PostMapping
    public ResponseEntity<ApiResponse<Long>> create(@Valid @RequestBody UsersVO vO) {
        Long id = usersService.save(vO);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UsersDTO>>> getAll() {
        List<UsersDTO> users = usersService.getAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsersDTO>> getById(@PathVariable Long id) {
        UsersDTO user = usersService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<UsersDTO>>> getByRole(@PathVariable String role) {
        List<UsersDTO> users = usersService.getByRole(role);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/instructors")
    public ResponseEntity<ApiResponse<List<UsersDTO>>> getInstructors() {
        List<UsersDTO> instructors = usersService.getInstructors();
        return ResponseEntity.ok(ApiResponse.success(instructors));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<UsersDTO>>> getStudents() {
        List<UsersDTO> students = usersService.getStudents();
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> update(@PathVariable Long id, @Valid @RequestBody UsersUpdateVO vO) {
        usersService.update(id, vO);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        usersService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        usersService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", null));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable Long id) {
        usersService.activate(id);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully", null));
    }
}
