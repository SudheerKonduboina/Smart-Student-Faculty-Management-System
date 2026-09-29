package com.sms.backend.service;

import com.sms.backend.dto.request.LeaveRequest;
import com.sms.backend.dto.request.LeaveReviewRequest;
import com.sms.backend.entity.*;
import com.sms.backend.exception.*;
import com.sms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveApplicationRepository leaveRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final NotificationService notificationService;

    @Transactional
    public LeaveApplication apply(Long studentUserId, LeaveRequest request) {
        Student student = studentRepository.findByUserId(studentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!request.getEndDate().isAfter(request.getStartDate()) &&
            !request.getEndDate().equals(request.getStartDate())) {
            throw new BadRequestException("End date must be on or after start date");
        }

        LeaveApplication leave = LeaveApplication.builder()
            .student(student).startDate(request.getStartDate())
            .endDate(request.getEndDate()).reason(request.getReason())
            .status(LeaveApplication.LeaveStatus.PENDING).build();
        LeaveApplication savedLeave = leaveRepository.save(leave);

        // Notify faculty in the student's department
        facultyRepository.findByDepartmentIdAndActiveTrue(student.getDepartment().getId())
            .forEach(f -> notificationService.send(f.getUser().getId(),
                Notification.NotificationType.INFO,
                "New Leave Request",
                student.getUser().getFirstName() + " " + student.getUser().getLastName() +
                    " has applied for leave from " + request.getStartDate() + " to " + request.getEndDate(),
                "LEAVE", savedLeave.getId()));
        return savedLeave;
    }

    @Transactional(readOnly = true)
    public Page<LeaveApplication> getLeaves(Long studentId, LeaveApplication.LeaveStatus status,
                                             Long departmentId, Pageable pageable) {
        return leaveRepository.findAllWithFilters(studentId, status, departmentId, pageable);
    }

    @Transactional(readOnly = true)
    public LeaveApplication getLeaveById(Long id) {
        return leaveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Leave application", id));
    }

    @Transactional
    public LeaveApplication review(Long leaveId, Long reviewerUserId, User.Role reviewerRole,
                                    LeaveReviewRequest request) {
        // Authorization: STUDENT must never call this
        if (reviewerRole == User.Role.STUDENT) {
            throw new BadRequestException("Students are not allowed to review leave applications");
        }
        if (request.getStatus() == LeaveApplication.LeaveStatus.PENDING) {
            throw new BadRequestException("Cannot set status back to PENDING");
        }

        LeaveApplication leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> new ResourceNotFoundException("Leave application", leaveId));

        // Extra check: student cannot review their own leave even if somehow role check passed
        if (leave.getStudent().getUser().getId().equals(reviewerUserId)) {
            throw new BadRequestException("You cannot review your own leave application");
        }

        User reviewer = userRepository.findById(reviewerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", reviewerUserId));

        leave.setStatus(request.getStatus());
        leave.setReviewedBy(reviewer);
        leave.setReviewedAt(LocalDateTime.now());
        leave.setReviewComment(request.getComment());
        leave = leaveRepository.save(leave);

        // Notify student
        Notification.NotificationType type = request.getStatus() == LeaveApplication.LeaveStatus.APPROVED
            ? Notification.NotificationType.SUCCESS : Notification.NotificationType.ERROR;
        String statusStr = request.getStatus() == LeaveApplication.LeaveStatus.APPROVED ? "Approved" : "Rejected";
        notificationService.send(leave.getStudent().getUser().getId(), type,
            "Leave Application " + statusStr,
            "Your leave request from " + leave.getStartDate() + " to " + leave.getEndDate() +
                " has been " + statusStr.toLowerCase() +
                (request.getComment() != null ? ". Comment: " + request.getComment() : ""),
            "LEAVE", leave.getId());

        return leave;
    }
}
