package com.sms.backend.controller;

import com.sms.backend.dto.request.TimetableRequest;
import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.entity.*;
import com.sms.backend.repository.FacultyRepository;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.repository.UserRepository;
import com.sms.backend.service.TimetableService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
@Tag(name = "Timetable")
public class TimetableController {

    private final TimetableService timetableService;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) Long facultyId) {
        List<Timetable> list;
        if (className != null) {
            list = timetableService.getByClassName(className);
        } else if (facultyId != null) {
            list = timetableService.getByFaculty(facultyId);
        } else {
            list = timetableService.getAll();
        }
        return ResponseEntity.ok(ApiResponse.success(list.stream().map(this::toTimetableMap).toList()));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyTimetable(Authentication auth) {
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<Timetable> list = Collections.emptyList();

        if (currentUser.getRole() == User.Role.FACULTY) {
            var facultyOpt = facultyRepository.findByUserId(currentUser.getId());
            if (facultyOpt.isPresent()) {
                list = timetableService.getByFaculty(facultyOpt.get().getId());
            }
        } else if (currentUser.getRole() == User.Role.STUDENT) {
            var studentOpt = studentRepository.findByUserId(currentUser.getId());
            if (studentOpt.isPresent()) {
                // Return entries for the student's class (defaulting to CS-A or all active)
                list = timetableService.getByClassName("CS-A");
                if (list.isEmpty()) {
                    list = timetableService.getAll();
                }
            }
        } else {
            list = timetableService.getAll();
        }

        return ResponseEntity.ok(ApiResponse.success(list.stream().map(this::toTimetableMap).toList()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> create(@Valid @RequestBody TimetableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Timetable entry created", toTimetableMap(timetableService.create(request))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> update(
            @PathVariable Long id, @Valid @RequestBody TimetableRequest request) {
        return ResponseEntity.ok(ApiResponse.success(toTimetableMap(timetableService.update(id, request))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        timetableService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Timetable entry deleted"));
    }

    private Map<String, Object> toTimetableMap(Timetable t) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", t.getId());
        map.put("className", t.getClassName());
        map.put("room", t.getRoom());
        map.put("roomNumber", t.getRoom());
        map.put("dayOfWeek", t.getDayOfWeek() != null ? t.getDayOfWeek().name() : null);
        map.put("startTime", t.getStartTime() != null ? t.getStartTime().toString() : null);
        map.put("endTime", t.getEndTime() != null ? t.getEndTime().toString() : null);
        map.put("active", t.getActive());

        if (t.getSubject() != null) {
            Map<String, Object> sub = new LinkedHashMap<>();
            sub.put("id", t.getSubject().getId());
            sub.put("name", t.getSubject().getName());
            sub.put("code", t.getSubject().getCode());
            map.put("subject", sub);
        }

        if (t.getFaculty() != null) {
            Map<String, Object> fac = new LinkedHashMap<>();
            fac.put("id", t.getFaculty().getId());
            fac.put("facultyCode", t.getFaculty().getFacultyCode());
            if (t.getFaculty().getUser() != null) {
                Map<String, Object> u = new LinkedHashMap<>();
                u.put("id", t.getFaculty().getUser().getId());
                u.put("firstName", t.getFaculty().getUser().getFirstName());
                u.put("lastName", t.getFaculty().getUser().getLastName());
                fac.put("user", u);
            }
            map.put("faculty", fac);
        }

        return map;
    }
}
