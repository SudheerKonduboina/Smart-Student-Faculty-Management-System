package com.sms.backend.controller;

import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.entity.*;
import com.sms.backend.exception.*;
import com.sms.backend.repository.*;
import com.sms.backend.service.GradeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
@Tag(name = "Grades")
public class GradeController {

    private final GradeService gradeService;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final GradeRepository gradeRepository;

    /**
     * Faculty: GET /grades — returns all grades for subjects belonging to this faculty.
     * Admin: same endpoint, returns all grades.
     */
    @GetMapping
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllGrades(Authentication auth) {
        Long userId = getUserId(auth);
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<Grade> grades;
        if (currentUser.getRole() == User.Role.ADMIN) {
            grades = gradeRepository.findAll();
        } else {
            var facultyOpt = facultyRepository.findByUserId(userId);
            grades = facultyOpt.map(f -> gradeRepository.findByFacultyId(f.getId())).orElse(Collections.emptyList());
        }
        return ResponseEntity.ok(ApiResponse.success(grades.stream().map(this::toGradeMap).toList()));
    }

    /**
     * Faculty: POST /grades
     * Supports both frontend's flat format:
     * { studentId, subjectId, gradeType, marksObtained, published }
     * and breakdown format:
     * { studentId, subjectId, internalMarks, assignmentMarks, examMarks, published }
     */
    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> saveGrade(
            @RequestBody Map<String, Object> body, Authentication auth) {
        Long userId = getUserId(auth);
        Faculty faculty = facultyRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Long studentId = body.get("studentId") != null ? ((Number) body.get("studentId")).longValue() : null;
        Long subjectId = body.get("subjectId") != null ? ((Number) body.get("subjectId")).longValue() : null;
        if (studentId == null || subjectId == null) {
            throw new BadRequestException("Student ID and Subject ID are required");
        }

        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId));

        var existing = gradeRepository.findByStudentIdAndSubjectId(studentId, subjectId);
        Grade g = existing.orElseGet(() -> Grade.builder().student(student).subject(subject).build());

        Double internal = body.get("internalMarks") != null ? ((Number) body.get("internalMarks")).doubleValue() : g.getInternalMarks();
        Double assignment = body.get("assignmentMarks") != null ? ((Number) body.get("assignmentMarks")).doubleValue() : g.getAssignmentMarks();
        Double exam = body.get("examMarks") != null ? ((Number) body.get("examMarks")).doubleValue() : g.getExamMarks();

        String gradeType = (String) body.get("gradeType");
        if (body.get("marksObtained") != null && body.get("marksObtained") instanceof Number) {
            double marks = ((Number) body.get("marksObtained")).doubleValue();
            if ("INTERNAL".equalsIgnoreCase(gradeType)) {
                internal = marks;
            } else if ("ASSIGNMENT".equalsIgnoreCase(gradeType)) {
                assignment = marks;
            } else {
                exam = marks;
            }
        }

        double intVal = internal != null ? internal : 0.0;
        double asgVal = assignment != null ? assignment : 0.0;
        double exmVal = exam != null ? exam : 0.0;
        double total = intVal + asgVal + exmVal;

        // If only marksObtained was supplied without breakdown, set total directly
        if (body.get("marksObtained") != null && internal == null && assignment == null && exam == null) {
            total = ((Number) body.get("marksObtained")).doubleValue();
        }

        g.setInternalMarks(internal);
        g.setAssignmentMarks(assignment);
        g.setExamMarks(exam);
        g.setTotalMarks(total);
        g.setGrade(computeGrade(total));

        if (body.containsKey("published")) {
            g.setPublished(Boolean.TRUE.equals(body.get("published")));
        } else if (g.getPublished() == null) {
            g.setPublished(false);
        }

        Grade saved = gradeRepository.save(g);
        return ResponseEntity.ok(ApiResponse.success(toGradeMap(saved)));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> publish(
            @PathVariable Long id, Authentication auth) {
        Grade published = gradeService.publishGrade(id, getUserId(auth));
        return ResponseEntity.ok(ApiResponse.success("Grade published", toGradeMap(published)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyGrades(Authentication auth) {
        Long userId = getUserId(auth);
        List<Grade> grades = gradeService.getStudentGrades(userId, true);
        return ResponseEntity.ok(ApiResponse.success(grades.stream().map(this::toGradeMap).toList()));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStudentGrades(
            @PathVariable Long studentId, Authentication auth) {
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        boolean isStudent = currentUser.getRole() == User.Role.STUDENT;
        List<Grade> grades = gradeService.getStudentGrades(studentId, isStudent);
        return ResponseEntity.ok(ApiResponse.success(grades.stream().map(this::toGradeMap).toList()));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSubjectGrades(
            @PathVariable Long subjectId, Authentication auth) {
        List<Grade> grades = gradeService.getSubjectGrades(subjectId, getUserId(auth));
        return ResponseEntity.ok(ApiResponse.success(grades.stream().map(this::toGradeMap).toList()));
    }

    private Long getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow().getId();
    }

    private String computeGrade(double total) {
        if (total >= 90) return "O";
        if (total >= 80) return "A+";
        if (total >= 70) return "A";
        if (total >= 60) return "B+";
        if (total >= 50) return "B";
        if (total >= 40) return "C";
        return "F";
    }

    private Map<String, Object> toGradeMap(Grade g) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", g.getId());

        if (g.getStudent() != null) {
            Map<String, Object> stu = new LinkedHashMap<>();
            stu.put("id", g.getStudent().getId());
            stu.put("studentCode", g.getStudent().getStudentCode());
            stu.put("rollNumber", g.getStudent().getStudentCode());
            if (g.getStudent().getUser() != null) {
                User u = g.getStudent().getUser();
                Map<String, Object> userMap = new LinkedHashMap<>();
                userMap.put("id", u.getId());
                userMap.put("firstName", u.getFirstName());
                userMap.put("lastName", u.getLastName());
                userMap.put("email", u.getEmail());
                stu.put("user", userMap);
                stu.put("firstName", u.getFirstName());
                stu.put("lastName", u.getLastName());
                map.put("studentName", u.getFirstName() + " " + u.getLastName());
            }
            map.put("student", stu);
        }

        if (g.getSubject() != null) {
            Map<String, Object> sub = new LinkedHashMap<>();
            sub.put("id", g.getSubject().getId());
            sub.put("name", g.getSubject().getName());
            sub.put("code", g.getSubject().getCode());
            map.put("subject", sub);
            map.put("subjectName", g.getSubject().getName());
            map.put("subjectCode", g.getSubject().getCode());
        }

        map.put("internalMarks", g.getInternalMarks());
        map.put("assignmentMarks", g.getAssignmentMarks());
        map.put("examMarks", g.getExamMarks());
        map.put("totalMarks", g.getTotalMarks());
        map.put("marksObtained", g.getTotalMarks() != null ? g.getTotalMarks() : 0.0);
        map.put("letterGrade", g.getGrade());
        map.put("grade", g.getGrade());
        map.put("gradeType", "OVERALL");
        map.put("published", Boolean.TRUE.equals(g.getPublished()));

        return map;
    }
}
