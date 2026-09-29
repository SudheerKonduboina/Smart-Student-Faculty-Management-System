package com.sms.backend.controller;

import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.dto.response.StudentDto;
import com.sms.backend.service.StudentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Students")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Page<StudentDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long department,
            @RequestParam(required = false) Integer semester) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(
            studentService.getAllStudents(search, department, semester, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY') or " +
                  "(hasRole('STUDENT') and @studentService.getStudentById(#id).userId == authentication.principal.username)")
    public ResponseEntity<ApiResponse<StudentDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentById(id)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDto>> getMyProfile(Authentication auth) {
        // Get user id from security context
        var user = studentService.getStudentByUserId(getUserIdFromAuth(auth));
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDto>> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        String fn = (String) updates.get("firstName");
        String ln = (String) updates.get("lastName");
        String phone = (String) updates.get("phone");
        Long deptId = updates.get("departmentId") != null ?
            ((Number) updates.get("departmentId")).longValue() : null;
        Integer sem = updates.get("semester") != null ?
            ((Number) updates.get("semester")).intValue() : null;
        return ResponseEntity.ok(ApiResponse.success(
            studentService.updateStudent(id, fn, ln, phone, deptId, sem)));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDto>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.toggleActive(id)));
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // We store email as principal; resolve via student service
        return null; // Will be handled in StudentService by email
    }
}
