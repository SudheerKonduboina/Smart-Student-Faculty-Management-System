package com.sms.backend.controller;

import com.sms.backend.dto.request.MarkAttendanceRequest;
import com.sms.backend.dto.request.QrMarkRequest;
import com.sms.backend.dto.request.QrSessionRequest;
import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.entity.Attendance;
import com.sms.backend.entity.AttendanceSession;
import com.sms.backend.repository.UserRepository;
import com.sms.backend.service.AttendanceService;
import com.sms.backend.service.StudentService;
import com.sms.backend.service.FacultyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final StudentService studentService;
    private final FacultyService facultyService;
    private final UserRepository userRepository;

    // ── Proper Manual Session endpoints ────────────────────────────────────────

    @PostMapping("/sessions")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> createSession(
            @RequestParam Long subjectId,
            @RequestParam String className,
            @RequestParam(required = false) String date,
            Authentication auth) {
        Long userId = getUserId(auth);
        LocalDate sessionDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        var session = attendanceService.createManualSession(userId, subjectId, className, sessionDate);
        return ResponseEntity.ok(ApiResponse.success("Session created", toSessionMap(session)));
    }

    @PostMapping("/sessions/{sessionId}/mark")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> markAttendance(
            @PathVariable Long sessionId,
            @RequestBody MarkAttendanceRequest request,
            Authentication auth) {
        request.setSessionId(sessionId);
        var records = attendanceService.markManualAttendance(getUserId(auth), request);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked", toAttendanceList(records)));
    }

    // ── Frontend legacy endpoint: POST /attendance/mark-manual ─────────────────
    // Accepts {subjectId, className, date, records:[{studentId, status}]}
    // Creates session automatically then marks attendance.

    @PostMapping("/mark-manual")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> markManual(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        Long userId = getUserId(auth);
        Long subjectId = body.get("subjectId") != null ? ((Number) body.get("subjectId")).longValue() : null;
        String className = body.get("className") != null ? (String) body.get("className") : "CS-A";
        String dateStr = (String) body.get("date");
        LocalDate sessionDate = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();

        var session = attendanceService.createManualSession(userId, subjectId, className, sessionDate);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> recordList = (List<Map<String, Object>>) body.get("records");
        MarkAttendanceRequest markRequest = new MarkAttendanceRequest();
        markRequest.setSessionId(session.getId());
        List<MarkAttendanceRequest.StudentAttendance> attendances = new ArrayList<>();
        if (recordList != null) {
            for (Map<String, Object> rec : recordList) {
                Long studentId = ((Number) rec.get("studentId")).longValue();
                String statusStr = rec.get("status") != null ? (String) rec.get("status") : "PRESENT";
                Attendance.AttendanceStatus status;
                try {
                    status = Attendance.AttendanceStatus.valueOf(statusStr);
                    if (status == Attendance.AttendanceStatus.LATE) {
                        status = Attendance.AttendanceStatus.PRESENT;
                    }
                } catch (Exception e) {
                    status = Attendance.AttendanceStatus.PRESENT;
                }
                attendances.add(new MarkAttendanceRequest.StudentAttendance(studentId, status));
            }
        }
        markRequest.setAttendances(attendances);
        var records = attendanceService.markManualAttendance(userId, markRequest);
        return ResponseEntity.ok(ApiResponse.success("Attendance session saved successfully!", toAttendanceList(records)));
    }

    // ── Frontend legacy endpoint: POST /attendance/qr-session ─────────────────
    // Accepts {subjectId, className, expiryMinutes}

    @PostMapping("/qr-session")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> startQrSessionLegacy(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        QrSessionRequest req = new QrSessionRequest();
        req.setSubjectId(body.get("subjectId") != null ? ((Number) body.get("subjectId")).longValue() : null);
        req.setClassName(body.get("className") != null ? (String) body.get("className") : "CS-A");
        req.setSessionDate(LocalDate.now());
        req.setExpiryMinutes(body.get("expiryMinutes") != null ? ((Number) body.get("expiryMinutes")).intValue() : 10);
        var result = attendanceService.startQrSession(getUserId(auth), req);
        return ResponseEntity.ok(ApiResponse.success("QR session started", result));
    }

    // ── QR proper endpoints ────────────────────────────────────────────────────

    @PostMapping("/qr/start")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> startQrSession(
            @Valid @RequestBody QrSessionRequest request, Authentication auth) {
        var result = attendanceService.startQrSession(getUserId(auth), request);
        return ResponseEntity.ok(ApiResponse.success("QR session started", result));
    }

    @GetMapping("/qr/{sessionId}/status")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Object>> qrStatus(
            @PathVariable Long sessionId, Authentication auth) {
        var result = attendanceService.getQrSessionStatus(sessionId, getUserId(auth));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // ── Frontend legacy: POST /attendance/mark-qr {token: "..."} ──────────────

    @PostMapping("/mark-qr")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Object>> markQrLegacy(
            @RequestBody Map<String, Object> body, Authentication auth) {
        String token = (String) body.get("token");
        QrMarkRequest req = new QrMarkRequest(token);
        var result = attendanceService.markQrAttendance(getUserId(auth), req);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully!", toAttendanceMap(result)));
    }

    @PostMapping("/qr/mark")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Object>> markQrAttendance(
            @Valid @RequestBody QrMarkRequest request, Authentication auth) {
        var result = attendanceService.markQrAttendance(getUserId(auth), request);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully!", toAttendanceMap(result)));
    }

    // ── Student view ───────────────────────────────────────────────────────────

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY') or hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStudentAttendance(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(
            attendanceService.getStudentAttendanceSummary(studentId)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Object>> getMyAttendance(Authentication auth) {
        var student = studentService.getStudentByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(
            attendanceService.getStudentAttendanceSummary(student.getId())));
    }

    // ── Admin view ─────────────────────────────────────────────────────────────

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getAdminView(
            @RequestParam(required = false) Long student,
            @RequestParam(required = false) Long subject,
            @RequestParam(required = false) Long faculty,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        LocalDate d = date != null ? LocalDate.parse(date) : null;
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(
            attendanceService.getAdminAttendanceView(student, subject, faculty, d, pageable)));
    }

    private Long getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"))
            .getId();
    }

    private Map<String, Object> toSessionMap(AttendanceSession session) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", session.getId());
        m.put("className", session.getClassName());
        m.put("sessionDate", session.getSessionDate() != null ? session.getSessionDate().toString() : null);
        m.put("sessionType", session.getSessionType() != null ? session.getSessionType().name() : null);
        m.put("active", session.getActive());
        m.put("status", Boolean.TRUE.equals(session.getActive()) ? "ACTIVE" : "INACTIVE");
        return m;
    }

    private Map<String, Object> toAttendanceMap(Attendance a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("status", a.getStatus() != null ? a.getStatus().name() : null);
        m.put("studentId", a.getStudent() != null ? a.getStudent().getId() : null);
        m.put("studentCode", a.getStudent() != null ? a.getStudent().getStudentCode() : null);
        m.put("markedAt", a.getMarkedAt() != null ? a.getMarkedAt().toString() : null);
        return m;
    }

    private List<Map<String, Object>> toAttendanceList(List<Attendance> list) {
        List<Map<String, Object>> res = new ArrayList<>();
        if (list != null) {
            for (Attendance a : list) {
                res.add(toAttendanceMap(a));
            }
        }
        return res;
    }
}
