package com.sms.backend.controller;

import com.sms.backend.dto.request.LeaveRequest;
import com.sms.backend.dto.request.LeaveReviewRequest;
import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.entity.LeaveApplication;
import com.sms.backend.entity.User;
import com.sms.backend.repository.UserRepository;
import com.sms.backend.service.LeaveService;
import com.sms.backend.service.StudentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Applications")
public class LeaveController {

    private final LeaveService leaveService;
    private final StudentService studentService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Object>> apply(
            @Valid @RequestBody LeaveRequest request, Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Leave application submitted",
                leaveService.apply(userId, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getLeaves(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) LeaveApplication.LeaveStatus status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {

        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();

        // Students can only see their own leaves
        if (currentUser.getRole() == User.Role.STUDENT) {
            var myStudent = studentService.getStudentByEmail(auth.getName());
            return ResponseEntity.ok(ApiResponse.success(
                leaveService.getLeaves(myStudent.getId(), status, null,
                    PageRequest.of(page, size, Sort.by("createdAt").descending()))));
        }

        return ResponseEntity.ok(ApiResponse.success(
            leaveService.getLeaves(studentId, status, departmentId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getLeaveById(id)));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> review(
            @PathVariable Long id,
            @Valid @RequestBody LeaveReviewRequest request,
            Authentication auth) {
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("Leave application reviewed",
            leaveService.review(id, currentUser.getId(), currentUser.getRole(), request)));
    }

    private Long getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow().getId();
    }
}
