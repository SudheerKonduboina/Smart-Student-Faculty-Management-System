package com.sms.backend.controller;

import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.entity.Department;
import com.sms.backend.exception.BadRequestException;
import com.sms.backend.exception.ConflictException;
import com.sms.backend.exception.ResourceNotFoundException;
import com.sms.backend.repository.DepartmentRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Tag(name = "Departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(departmentRepository.findByActiveTrue()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
            departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id))));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Department>> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String code = body.get("code");
        if (name == null || code == null) throw new BadRequestException("Name and code are required");
        if (departmentRepository.existsByCode(code)) throw new ConflictException("Department code already exists: " + code);
        if (departmentRepository.existsByName(name)) throw new ConflictException("Department name already exists: " + name);
        Department dept = Department.builder().name(name).code(code).active(true).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(departmentRepository.save(dept)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Department>> update(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        Department dept = departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        if (body.containsKey("name")) dept.setName(body.get("name"));
        if (body.containsKey("code")) dept.setCode(body.get("code"));
        return ResponseEntity.ok(ApiResponse.success(departmentRepository.save(dept)));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Department>> toggleActive(@PathVariable Long id) {
        Department dept = departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        if (!dept.getActive()) {
            dept.setActive(true);
        } else {
            if (departmentRepository.hasActiveStudents(id)) {
                throw new BadRequestException("Cannot deactivate department with active students");
            }
            if (departmentRepository.hasActiveFaculty(id)) {
                throw new BadRequestException("Cannot deactivate department with active faculty");
            }
            dept.setActive(false);
        }
        return ResponseEntity.ok(ApiResponse.success(departmentRepository.save(dept)));
    }
}
