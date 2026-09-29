package com.sms.backend.controller;

import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardStats()));
    }

    @GetMapping("/attendance")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> attendance() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAttendanceAnalytics()));
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> assignments() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAssignmentAnalytics()));
    }

    @GetMapping("/grades")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> grades() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getGradeAnalytics()));
    }

    @GetMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> students() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getStudentAnalytics()));
    }
}
