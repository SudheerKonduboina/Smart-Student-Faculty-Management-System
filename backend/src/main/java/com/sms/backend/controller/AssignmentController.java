package com.sms.backend.controller;

import com.sms.backend.dto.request.AssignmentRequest;
import com.sms.backend.dto.request.GradeSubmissionRequest;
import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.entity.AssignmentSubmission;
import com.sms.backend.repository.UserRepository;
import com.sms.backend.service.AssignmentService;
import com.sms.backend.service.FileStorageService;
import com.sms.backend.service.StudentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@Tag(name = "Assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final FileStorageService fileStorageService;
    private final StudentService studentService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAll(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long facultyId,
            @RequestParam(required = false) String className,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            assignmentService.getAssignments(subjectId, facultyId, className,
                PageRequest.of(page, size, Sort.by("dueDate").ascending()))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAssignmentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> create(
            @Valid @RequestBody AssignmentRequest request, Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Assignment created", assignmentService.createAssignment(userId, request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> update(
            @PathVariable Long id, @Valid @RequestBody AssignmentRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
            assignmentService.updateAssignment(id, getUserId(auth), request)));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> toggleActive(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
            assignmentService.toggleActive(id, getUserId(auth))));
    }

    // Student submission
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Object>> submit(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String notes,
            Authentication auth) {
        var result = assignmentService.submitAssignment(getUserId(auth), id, file, notes);
        return ResponseEntity.ok(ApiResponse.success("Assignment submitted", result));
    }

    // Faculty - view submissions
    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getSubmissions(
            @PathVariable Long id,
            @RequestParam(required = false) AssignmentSubmission.SubmissionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
            assignmentService.getSubmissions(id, getUserId(auth), status, PageRequest.of(page, size))));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Object>> getMySubmissions(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
            assignmentService.getStudentSubmissions(getUserId(auth))));
    }

    // Grade submission
    @PutMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> gradeSubmission(
            @PathVariable Long submissionId,
            @Valid @RequestBody GradeSubmissionRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
            assignmentService.gradeSubmission(submissionId, getUserId(auth), request)));
    }

    // File download with authorization
    @GetMapping("/submissions/{submissionId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long submissionId, Authentication auth) throws MalformedURLException {
        var submission = assignmentService.getSubmission(submissionId);
        Long userId = getUserId(auth);

        // Authorization: student (own), faculty (own assignment), admin
        boolean isStudent = submission.getStudent().getUser().getId().equals(userId);
        boolean isFaculty = submission.getAssignment().getFaculty().getUser().getId().equals(userId);

        if (!isStudent && !isFaculty) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (submission.getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }

        Path path = fileStorageService.getFilePath(submission.getFilePath());
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) return ResponseEntity.notFound().build();

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + submission.getOriginalFilename() + "\"")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(resource);
    }

    private Long getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow().getId();
    }
}
