package com.sms.backend.service;

import com.sms.backend.dto.request.MarkAttendanceRequest;
import com.sms.backend.dto.request.QrMarkRequest;
import com.sms.backend.dto.request.QrSessionRequest;
import com.sms.backend.entity.*;
import com.sms.backend.exception.BadRequestException;
import com.sms.backend.exception.ConflictException;
import com.sms.backend.exception.ResourceNotFoundException;
import com.sms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationService notificationService;
    private final WebClient pythonServiceWebClient;

    @Value("${attendance.warning.threshold}")
    private double warningThreshold;

    // ── Manual Session ─────────────────────────────────────────────────────────

    @Transactional
    public AttendanceSession createManualSession(Long facultyUserId, Long subjectId, String className, LocalDate date) {
        Faculty faculty = facultyRepository.findByUserId(facultyUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId));

        AttendanceSession session = AttendanceSession.builder()
            .faculty(faculty).subject(subject).className(className)
            .sessionDate(date).sessionType(AttendanceSession.SessionType.MANUAL)
            .active(true).build();
        return sessionRepository.save(session);
    }

    @Transactional
    public List<Attendance> markManualAttendance(Long facultyUserId, MarkAttendanceRequest request) {
        AttendanceSession session = sessionRepository.findById(request.getSessionId())
            .orElseThrow(() -> new ResourceNotFoundException("Session", request.getSessionId()));

        // Verify faculty owns this session
        if (!session.getFaculty().getUser().getId().equals(facultyUserId)) {
            throw new BadRequestException("You are not authorized to mark attendance for this session");
        }

        List<Attendance> results = new ArrayList<>();
        for (MarkAttendanceRequest.StudentAttendance sa : request.getAttendances()) {
            Student student = studentRepository.findById(sa.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", sa.getStudentId()));

            Optional<Attendance> existing = attendanceRepository.findByStudentAndSession(student, session);
            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
                attendance.setStatus(sa.getStatus());
                attendance.setMarkedAt(LocalDateTime.now());
            } else {
                attendance = Attendance.builder()
                    .student(student).session(session)
                    .status(sa.getStatus()).markedAt(LocalDateTime.now()).build();
            }
            results.add(attendanceRepository.save(attendance));
            triggerAttendanceWarningCheck(student, session.getSubject());
        }
        return results;
    }

    // ── QR Session ─────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> startQrSession(Long facultyUserId, QrSessionRequest request) {
        Faculty faculty = facultyRepository.findByUserId(facultyUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));

        // Create session in DB first
        AttendanceSession session = AttendanceSession.builder()
            .faculty(faculty).subject(subject).className(request.getClassName())
            .sessionDate(request.getSessionDate()).sessionType(AttendanceSession.SessionType.QR)
            .active(true).build();
        session = sessionRepository.save(session);

        // Call FastAPI for QR generation
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("sessionId", session.getId());
            body.put("facultyId", faculty.getId());
            body.put("subjectId", subject.getId());
            body.put("expiresInSeconds", (request.getExpiryMinutes() != null ? request.getExpiryMinutes() : 10) * 60);

            @SuppressWarnings("unchecked")
            Map<String, Object> qrResponse = pythonServiceWebClient.post()
                .uri("/qr/generate")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (qrResponse != null && qrResponse.containsKey("token")) {
                String token = (String) qrResponse.get("token");
                LocalDateTime expiresAt = LocalDateTime.now()
                    .plusMinutes(request.getExpiryMinutes() != null ? request.getExpiryMinutes() : 10);
                session.setQrToken(token);
                session.setQrExpiresAt(expiresAt);
                sessionRepository.save(session);

                Map<String, Object> result = new HashMap<>(qrResponse);
                result.put("sessionId", session.getId());
                result.put("expiresAt", expiresAt);
                return result;
            }
        } catch (Exception e) {
            log.warn("FastAPI QR service unavailable, generating fallback token: {}", e.getMessage());
            // Fallback: generate simple UUID token
            String fallbackToken = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
            LocalDateTime expiresAt = LocalDateTime.now()
                .plusMinutes(request.getExpiryMinutes() != null ? request.getExpiryMinutes() : 10);
            session.setQrToken(fallbackToken);
            session.setQrExpiresAt(expiresAt);
            sessionRepository.save(session);

            Map<String, Object> result = new HashMap<>();
            result.put("sessionId", session.getId());
            result.put("token", fallbackToken);
            result.put("qrImageBase64", null);
            result.put("expiresAt", expiresAt);
            return result;
        }
        throw new BadRequestException("Failed to generate QR code");
    }

    @Transactional
    public Attendance markQrAttendance(Long studentUserId, QrMarkRequest request) {
        Student student = studentRepository.findByUserId(studentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Find session by token
        AttendanceSession session = sessionRepository.findByQrToken(request.getToken())
            .orElseThrow(() -> new BadRequestException("Invalid QR code or session not found"));

        // Validate expiry
        if (session.getQrExpiresAt() != null && LocalDateTime.now().isAfter(session.getQrExpiresAt())) {
            throw new BadRequestException("QR code has expired. Please ask your faculty to generate a new one.");
        }

        // Validate session is active
        if (!session.getActive()) {
            throw new BadRequestException("This attendance session is no longer active.");
        }

        // Check duplicate
        if (attendanceRepository.existsByStudentIdAndSessionId(student.getId(), session.getId())) {
            throw new ConflictException("Attendance already marked for this session.");
        }

        // Optionally validate with FastAPI (if available)
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> validation = pythonServiceWebClient.get()
                .uri("/qr/validate/" + request.getToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (validation != null && Boolean.FALSE.equals(validation.get("valid"))) {
                throw new BadRequestException("QR code is not valid.");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.warn("FastAPI validation unavailable, using DB expiry check only: {}", e.getMessage());
        }

        Attendance attendance = Attendance.builder()
            .student(student).session(session)
            .status(Attendance.AttendanceStatus.PRESENT)
            .markedAt(LocalDateTime.now()).build();
        attendance = attendanceRepository.save(attendance);

        triggerAttendanceWarningCheck(student, session.getSubject());
        return attendance;
    }

    // ── Student Attendance Summary ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAttendanceSummary(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        // Get distinct subjects from sessions for this student's class
        List<Object[]> sessions = new ArrayList<>();
        List<Subject> subjects = subjectRepository.findByDepartmentIdAndActiveTrue(student.getDepartment().getId());

        List<Map<String, Object>> summaries = new ArrayList<>();
        for (Subject subject : subjects) {
            long totalSessions = attendanceRepository.countTotalSessionsBySubjectAndClass(
                subject.getId(), student.getDepartment().getCode() + "-S" + student.getSemester());
            // Fallback: count all sessions for subject regardless of class name
            if (totalSessions == 0) {
                List<Attendance> all = attendanceRepository.findByStudentAndSubject(studentId, subject.getId());
                totalSessions = all.stream().map(a -> a.getSession().getId()).distinct().count();
                if (totalSessions == 0) continue;
                long present = all.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
                double pct = totalSessions > 0 ? (present * 100.0) / totalSessions : 0;
                Map<String, Object> s = new HashMap<>();
                s.put("subjectId", subject.getId());
                s.put("subjectName", subject.getName());
                s.put("subjectCode", subject.getCode());
                s.put("totalSessions", totalSessions);
                s.put("present", present);
                s.put("absent", totalSessions - present);
                s.put("percentage", Math.round(pct * 10.0) / 10.0);
                s.put("belowThreshold", pct < warningThreshold);
                summaries.add(s);
            } else {
                long present = attendanceRepository.countPresentByStudentAndSubject(studentId, subject.getId());
                double pct = (present * 100.0) / totalSessions;
                Map<String, Object> s = new HashMap<>();
                s.put("subjectId", subject.getId());
                s.put("subjectName", subject.getName());
                s.put("subjectCode", subject.getCode());
                s.put("totalSessions", totalSessions);
                s.put("present", present);
                s.put("absent", totalSessions - present);
                s.put("percentage", Math.round(pct * 10.0) / 10.0);
                s.put("belowThreshold", pct < warningThreshold);
                summaries.add(s);
            }
        }
        return summaries;
    }

    @Transactional(readOnly = true)
    public Page<Attendance> getAdminAttendanceView(Long studentId, Long subjectId, Long facultyId,
                                                    LocalDate date, Pageable pageable) {
        return attendanceRepository.findAllWithFilters(studentId, subjectId, facultyId, date, pageable);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getQrSessionStatus(Long sessionId, Long facultyUserId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session", sessionId));
        if (!session.getFaculty().getUser().getId().equals(facultyUserId)) {
            throw new BadRequestException("Not authorized to view this session");
        }
        List<Attendance> records = attendanceRepository.findBySessionId(sessionId);
        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", session.getId());
        result.put("active", session.getActive() && (session.getQrExpiresAt() == null ||
            LocalDateTime.now().isBefore(session.getQrExpiresAt())));
        result.put("expiresAt", session.getQrExpiresAt());
        result.put("markedCount", records.size());
        result.put("attendances", records.stream().map(a -> Map.of(
            "studentId", a.getStudent().getId(),
            "studentName", a.getStudent().getUser().getFirstName() + " " + a.getStudent().getUser().getLastName(),
            "status", a.getStatus(),
            "markedAt", a.getMarkedAt()
        )).toList());
        return result;
    }

    private void triggerAttendanceWarningCheck(Student student, Subject subject) {
        List<Attendance> all = attendanceRepository.findByStudentAndSubject(
            student.getId(), subject.getId());
        long total = all.stream().map(a -> a.getSession().getId()).distinct().count();
        long present = all.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
        notificationService.checkAndSendAttendanceWarning(
            student.getUser().getId(), subject.getId(), subject.getName(),
            present, total, warningThreshold);
    }
}
