package com.sms.backend.controller;

import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.entity.Subject;
import com.sms.backend.exception.*;
import com.sms.backend.repository.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@Tag(name = "Subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll(
            @RequestParam(required = false) Long department,
            @RequestParam(required = false) Long faculty) {
        List<Subject> subjects;
        if (department != null) {
            subjects = subjectRepository.findByDepartmentIdAndActiveTrue(department);
        } else if (faculty != null) {
            subjects = subjectRepository.findByFacultyIdAndActiveTrue(faculty);
        } else {
            subjects = subjectRepository.findByActiveTrue();
        }
        return ResponseEntity.ok(ApiResponse.success(subjects.stream().map(this::toSubjectMap).toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable Long id) {
        Subject s = subjectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subject", id));
        return ResponseEntity.ok(ApiResponse.success(toSubjectMap(s)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        String name = (String) body.get("name");
        if (code == null || name == null) throw new BadRequestException("Code and name are required");
        if (subjectRepository.existsByCode(code)) throw new ConflictException("Subject code already exists");
        Long deptId = body.get("departmentId") != null ? ((Number) body.get("departmentId")).longValue() : null;
        if (deptId == null) throw new BadRequestException("Department is required");
        var dept = departmentRepository.findById(deptId)
            .orElseThrow(() -> new ResourceNotFoundException("Department", deptId));
        Subject s = Subject.builder().code(code).name(name).department(dept).active(true)
            .credits(body.get("credits") != null ? ((Number) body.get("credits")).intValue() : 3).build();
        if (body.get("facultyId") != null) {
            Long fid = ((Number) body.get("facultyId")).longValue();
            s.setFaculty(facultyRepository.findById(fid).orElseThrow(() -> new ResourceNotFoundException("Faculty", fid)));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toSubjectMap(subjectRepository.save(s))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Subject s = subjectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Subject", id));
        if (body.containsKey("name")) s.setName((String) body.get("name"));
        if (body.containsKey("code")) s.setCode((String) body.get("code"));
        if (body.containsKey("credits")) s.setCredits(((Number) body.get("credits")).intValue());
        if (body.containsKey("facultyId") && body.get("facultyId") != null) {
            Long fid = ((Number) body.get("facultyId")).longValue();
            s.setFaculty(facultyRepository.findById(fid).orElseThrow(() -> new ResourceNotFoundException("Faculty", fid)));
        }
        return ResponseEntity.ok(ApiResponse.success(toSubjectMap(subjectRepository.save(s))));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleActive(@PathVariable Long id) {
        Subject s = subjectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Subject", id));
        if (s.getActive() && subjectRepository.hasActiveTimetable(id)) {
            throw new BadRequestException("Cannot deactivate subject with active timetable entries");
        }
        s.setActive(!s.getActive());
        return ResponseEntity.ok(ApiResponse.success(toSubjectMap(subjectRepository.save(s))));
    }

    private Map<String, Object> toSubjectMap(Subject s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("code", s.getCode());
        map.put("name", s.getName());
        map.put("credits", s.getCredits());
        map.put("active", s.getActive());

        if (s.getDepartment() != null) {
            Map<String, Object> dept = new LinkedHashMap<>();
            dept.put("id", s.getDepartment().getId());
            dept.put("name", s.getDepartment().getName());
            dept.put("code", s.getDepartment().getCode());
            map.put("department", dept);
        } else {
            map.put("department", null);
        }

        if (s.getFaculty() != null) {
            Map<String, Object> fac = new LinkedHashMap<>();
            fac.put("id", s.getFaculty().getId());
            fac.put("facultyCode", s.getFaculty().getFacultyCode());
            if (s.getFaculty().getUser() != null) {
                Map<String, Object> u = new LinkedHashMap<>();
                u.put("id", s.getFaculty().getUser().getId());
                u.put("firstName", s.getFaculty().getUser().getFirstName());
                u.put("lastName", s.getFaculty().getUser().getLastName());
                u.put("email", s.getFaculty().getUser().getEmail());
                fac.put("user", u);
            }
            map.put("faculty", fac);
        } else {
            map.put("faculty", null);
        }

        return map;
    }
}
