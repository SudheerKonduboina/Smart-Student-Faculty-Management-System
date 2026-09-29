package com.sms.backend.controller;

import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.dto.response.FacultyDto;
import com.sms.backend.service.FacultyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
@Tag(name = "Faculty")
public class FacultyController {

    private final FacultyService facultyService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<FacultyDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long department) {
        return ResponseEntity.ok(ApiResponse.success(
            facultyService.getAllFaculty(search, department, PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<FacultyDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(facultyService.getFacultyById(id)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<FacultyDto>> getMyProfile(Authentication auth) {
        var faculty = facultyService.getFacultyByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(faculty));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacultyDto>> update(@PathVariable Long id,
                                                           @RequestBody Map<String, Object> updates) {
        String fn = (String) updates.get("firstName");
        String ln = (String) updates.get("lastName");
        String phone = (String) updates.get("phone");
        Long deptId = updates.get("departmentId") != null ?
            ((Number) updates.get("departmentId")).longValue() : null;
        return ResponseEntity.ok(ApiResponse.success(
            facultyService.updateFaculty(id, fn, ln, phone, deptId)));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacultyDto>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(facultyService.toggleActive(id)));
    }
}
