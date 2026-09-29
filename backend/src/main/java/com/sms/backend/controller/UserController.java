package com.sms.backend.controller;

import com.sms.backend.dto.request.CreateUserRequest;
import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.dto.response.StudentDto;
import com.sms.backend.dto.response.FacultyDto;
import com.sms.backend.entity.User;
import com.sms.backend.exception.BadRequestException;
import com.sms.backend.service.FacultyService;
import com.sms.backend.service.StudentService;
import com.sms.backend.repository.UserRepository;
import com.sms.backend.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management (Admin)")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final StudentService studentService;
    private final FacultyService facultyService;
    private final AuthService authService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Object>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) User.Role role,
            @RequestParam(required = false) Boolean active) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var users = userRepository.findAllWithFilters(search, role, pageable);
        return ResponseEntity.ok(ApiResponse.success(users.map(u -> (Object) authService.mapToDto(u))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createUser(@Valid @RequestBody CreateUserRequest req) {
        Object result;
        if (req.getRole() == User.Role.STUDENT) {
            if (req.getDepartmentId() == null) throw new BadRequestException("Department is required for students");
            result = studentService.createStudent(req.getEmail(), req.getPassword(),
                req.getFirstName(), req.getLastName(), req.getPhone(),
                req.getDepartmentId(), req.getSemester(), req.getEnrollmentDate());
        } else if (req.getRole() == User.Role.FACULTY) {
            if (req.getDepartmentId() == null) throw new BadRequestException("Department is required for faculty");
            result = facultyService.createFaculty(req.getEmail(), req.getPassword(),
                req.getFirstName(), req.getLastName(), req.getPhone(),
                req.getDepartmentId(), req.getJoinedDate());
        } else {
            throw new BadRequestException("Use admin management for creating admin users");
        }
        return ResponseEntity.ok(ApiResponse.success("User created successfully", result));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<Object>> toggleActive(@PathVariable Long id,
                                                             @RequestParam User.Role role) {
        Object result;
        if (role == User.Role.STUDENT) {
            result = studentService.toggleActive(id);
        } else if (role == User.Role.FACULTY) {
            result = facultyService.toggleActive(id);
        } else {
            throw new BadRequestException("Cannot toggle admin via this endpoint");
        }
        return ResponseEntity.ok(ApiResponse.success("Status updated", result));
    }
}
