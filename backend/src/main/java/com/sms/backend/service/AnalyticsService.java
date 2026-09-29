package com.sms.backend.service;

import com.sms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final LeaveApplicationRepository leaveRepository;
    private final GradeRepository gradeRepository;
    private final AttendanceRepository attendanceRepository;

    @Value("${attendance.warning.threshold:75}")
    private double threshold;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalStudents", studentRepository.countByActive(true));
        stats.put("totalFaculty", facultyRepository.countByActive(true));
        stats.put("totalDepartments", departmentRepository.findByActiveTrue().size());
        stats.put("totalSubjects", subjectRepository.findByActiveTrue().size());
        stats.put("totalAssignments", assignmentRepository.countByActiveTrue());
        stats.put("pendingLeaves", leaveRepository.countByStatus(
            com.sms.backend.entity.LeaveApplication.LeaveStatus.PENDING));
        stats.put("totalUsers", userRepository.count());
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceAnalytics() {
        Map<String, Object> result = new LinkedHashMap<>();

        // Subject comparison
        List<Map<String, Object>> subjectComparison = new ArrayList<>();
        subjectRepository.findByActiveTrue().forEach(sub -> {
            Double avg = gradeRepository.avgMarksBySubject(sub.getId());
            Map<String, Object> m = new HashMap<>();
            m.put("subjectId", sub.getId());
            m.put("subject", sub.getName());
            m.put("code", sub.getCode());
            // Count attendances
            long present = attendanceRepository.countPresentByStudentAndSubject(0L, sub.getId());
            subjectComparison.add(m);
        });
        result.put("subjectComparison", subjectComparison);
        result.put("warningThreshold", threshold);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAssignmentAnalytics() {
        Map<String, Object> result = new LinkedHashMap<>();
        long total = assignmentRepository.countByActiveTrue();
        long submitted = submissionRepository.countByStatus(
            com.sms.backend.entity.AssignmentSubmission.SubmissionStatus.SUBMITTED);
        long late = submissionRepository.countByStatus(
            com.sms.backend.entity.AssignmentSubmission.SubmissionStatus.LATE);
        long graded = submissionRepository.countByStatus(
            com.sms.backend.entity.AssignmentSubmission.SubmissionStatus.GRADED);
        result.put("total", total);
        result.put("submitted", submitted);
        result.put("late", late);
        result.put("graded", graded);
        result.put("pending", total - submitted - late - graded);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGradeAnalytics() {
        Map<String, Object> result = new LinkedHashMap<>();

        // Grade distribution
        List<Object[]> dist = gradeRepository.gradeDistribution();
        List<Map<String, Object>> distribution = new ArrayList<>();
        for (Object[] row : dist) {
            distribution.add(Map.of("grade", row[0], "count", row[1]));
        }
        result.put("gradeDistribution", distribution);

        // Avg by subject
        List<Map<String, Object>> avgBySubject = new ArrayList<>();
        subjectRepository.findByActiveTrue().forEach(sub -> {
            Double avg = gradeRepository.avgMarksBySubject(sub.getId());
            if (avg != null) {
                avgBySubject.add(Map.of("subject", sub.getName(), "avg",
                    Math.round(avg * 10.0) / 10.0));
            }
        });
        result.put("avgBySubject", avgBySubject);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentAnalytics() {
        Map<String, Object> result = new LinkedHashMap<>();

        List<Map<String, Object>> byDept = new ArrayList<>();
        departmentRepository.findByActiveTrue().forEach(d -> {
            long count = studentRepository.findByDepartmentIdAndActiveTrue(d.getId()).size();
            byDept.add(Map.of("department", d.getName(), "code", d.getCode(), "count", count));
        });
        result.put("byDepartment", byDept);
        result.put("activeCount", studentRepository.countByActive(true));
        result.put("inactiveCount", studentRepository.countByActive(false));
        return result;
    }
}
