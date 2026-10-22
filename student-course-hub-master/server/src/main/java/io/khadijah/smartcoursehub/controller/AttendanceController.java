package io.khadijah.smartcoursehub.controller;

import io.khadijah.smartcoursehub.dto.ApiResponse;
import io.khadijah.smartcoursehub.dto.AttendanceDTO;
import io.khadijah.smartcoursehub.dto.AttendanceRecordDTO;
import io.khadijah.smartcoursehub.dto.AttendanceSummaryDTO;
import io.khadijah.smartcoursehub.entity.ClassSession;
import io.khadijah.smartcoursehub.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // UAMS Q6.1: POST /api/sections/{id}/sessions/week
    @PostMapping("/api/sections/{sectionId}/sessions/week")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<ClassSession>>> generateWeeklySessions(
            @PathVariable Long sectionId,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        
        List<ClassSession> sessions = attendanceService.generateWeeklySessions(sectionId, startDate);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    // UAMS Q6.2: GET /api/sections/{id}/sessions
    @GetMapping("/api/sections/{sectionId}/sessions")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<ClassSession>>> getSectionSessions(@PathVariable Long sectionId) {
        List<ClassSession> sessions = attendanceService.getSessionsBySection(sectionId);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    // UAMS Q6.3: POST /api/sessions/{id}/attendance
    @PostMapping("/api/sessions/{sessionId}/attendance")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> markAttendance(
            @PathVariable Long sessionId,
            @RequestBody List<AttendanceRecordDTO> records,
            HttpServletRequest request) {
        Long instructorId = (Long) request.getAttribute("userId");
        attendanceService.markAttendance(sessionId, records, instructorId);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", null));
    }
    
    // Additional: Get attendance for a session (Useful for UI)
    @GetMapping("/api/sessions/{sessionId}/attendance")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getSessionAttendance(@PathVariable Long sessionId) {
        List<AttendanceDTO> attendance = attendanceService.getAttendanceBySession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    // UAMS Q6.4: GET /api/students/me/attendance?sectionId=
    @GetMapping("/api/student/attendance")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getMyAttendance(
            @RequestParam(required = false) Long sectionId,
            HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        List<AttendanceDTO> attendance;
        if (sectionId != null) {
            attendance = attendanceService.getStudentAttendanceForSection(studentId, sectionId);
        } else {
            attendance = attendanceService.getStudentAttendance(studentId);
        }
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/api/student/attendance/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AttendanceSummaryDTO>>> getMyAttendanceSummary(HttpServletRequest request) {
        Long studentId = (Long) request.getAttribute("userId");
        List<AttendanceSummaryDTO> summary = attendanceService.getStudentAttendanceSummary(studentId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}