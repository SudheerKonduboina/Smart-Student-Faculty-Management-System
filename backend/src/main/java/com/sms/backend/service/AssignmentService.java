package com.sms.backend.service;

import com.sms.backend.dto.request.AssignmentRequest;
import com.sms.backend.dto.request.GradeSubmissionRequest;
import com.sms.backend.entity.*;
import com.sms.backend.exception.*;
import com.sms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    @Value("${attendance.warning.threshold:75}")
    private double threshold;

    // ── Assignments ─────────────────────────────────────────────────────────────

    @Transactional
    public Assignment createAssignment(Long facultyUserId, AssignmentRequest request) {
        Faculty faculty = facultyRepository.findByUserId(facultyUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));

        Assignment assignment = Assignment.builder()
            .faculty(faculty).subject(subject).className(request.getClassName())
            .title(request.getTitle()).description(request.getDescription())
            .dueDate(request.getDueDate()).maxMarks(request.getMaxMarks())
            .active(true).build();
        assignment = assignmentRepository.save(assignment);

        // Notify all students in the department+semester
        List<Student> students = studentRepository.findByDepartmentIdAndActiveTrue(subject.getDepartment().getId());
        for (Student s : students) {
            notificationService.send(s.getUser().getId(),
                Notification.NotificationType.INFO,
                "New Assignment: " + request.getTitle(),
                "A new assignment has been posted in " + subject.getName() + ". Due: " + request.getDueDate(),
                "ASSIGNMENT", assignment.getId());
        }
        return assignment;
    }

    @Transactional(readOnly = true)
    public Page<Assignment> getAssignments(Long subjectId, Long facultyId, String className, Pageable pageable) {
        return assignmentRepository.findAllWithFilters(subjectId, facultyId, className, pageable);
    }

    @Transactional(readOnly = true)
    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Assignment", id));
    }

    @Transactional
    public Assignment updateAssignment(Long id, Long facultyUserId, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Assignment", id));
        if (!assignment.getFaculty().getUser().getId().equals(facultyUserId)) {
            throw new BadRequestException("You are not authorized to edit this assignment");
        }
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setSubject(subject);
        assignment.setClassName(request.getClassName());
        assignment.setDueDate(request.getDueDate());
        assignment.setMaxMarks(request.getMaxMarks());
        return assignmentRepository.save(assignment);
    }

    @Transactional
    public Assignment toggleActive(Long id, Long facultyUserId) {
        Assignment assignment = assignmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Assignment", id));
        assignment.setActive(!assignment.getActive());
        return assignmentRepository.save(assignment);
    }

    // ── Submissions ─────────────────────────────────────────────────────────────

    @Transactional
    public AssignmentSubmission submitAssignment(Long studentUserId, Long assignmentId,
                                                  MultipartFile file, String notes) {
        Student student = studentRepository.findByUserId(studentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Assignment", assignmentId));

        // Store file
        String filePath = null;
        String originalFilename = null;
        Long fileSize = null;
        String fileType = null;
        if (file != null && !file.isEmpty()) {
            filePath = fileStorageService.storeFile(file, "submissions");
            originalFilename = file.getOriginalFilename();
            fileSize = file.getSize();
            fileType = file.getContentType();
        }

        // Detect late submission
        AssignmentSubmission.SubmissionStatus status = LocalDateTime.now().toLocalDate()
            .isAfter(assignment.getDueDate())
            ? AssignmentSubmission.SubmissionStatus.LATE
            : AssignmentSubmission.SubmissionStatus.SUBMITTED;

        // Resubmission: update if exists
        AssignmentSubmission submission;
        var existing = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId());
        if (existing.isPresent()) {
            submission = existing.get();
            if (filePath != null) {
                submission.setFilePath(filePath);
                submission.setOriginalFilename(originalFilename);
                submission.setFileSize(fileSize);
                submission.setFileType(fileType);
            }
            submission.setNotes(notes);
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setStatus(status);
            submission.setMarks(null);
            submission.setFeedback(null);
        } else {
            submission = AssignmentSubmission.builder()
                .assignment(assignment).student(student)
                .filePath(filePath).originalFilename(originalFilename)
                .fileSize(fileSize).fileType(fileType)
                .notes(notes).submittedAt(LocalDateTime.now())
                .status(status).build();
        }
        submission = submissionRepository.save(submission);

        // Notify faculty
        notificationService.send(assignment.getFaculty().getUser().getId(),
            Notification.NotificationType.INFO,
            "New Submission: " + assignment.getTitle(),
            student.getUser().getFirstName() + " " + student.getUser().getLastName() +
                " submitted assignment '" + assignment.getTitle() + "'",
            "SUBMISSION", submission.getId());

        return submission;
    }

    @Transactional(readOnly = true)
    public Page<AssignmentSubmission> getSubmissions(Long assignmentId, Long facultyUserId,
                                                      AssignmentSubmission.SubmissionStatus status,
                                                      Pageable pageable) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Assignment", assignmentId));
        if (!assignment.getFaculty().getUser().getId().equals(facultyUserId)) {
            throw new BadRequestException("Not authorized to view submissions for this assignment");
        }
        return submissionRepository.findByAssignmentWithFilters(assignmentId, status, pageable);
    }

    @Transactional
    public AssignmentSubmission gradeSubmission(Long submissionId, Long facultyUserId, GradeSubmissionRequest req) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new ResourceNotFoundException("Submission", submissionId));
        if (!submission.getAssignment().getFaculty().getUser().getId().equals(facultyUserId)) {
            throw new BadRequestException("Not authorized to grade this submission");
        }
        if (req.getMarks() > submission.getAssignment().getMaxMarks()) {
            throw new BadRequestException("Marks cannot exceed max marks: " + submission.getAssignment().getMaxMarks());
        }
        submission.setMarks(req.getMarks());
        submission.setFeedback(req.getFeedback());
        submission.setStatus(AssignmentSubmission.SubmissionStatus.GRADED);
        submission = submissionRepository.save(submission);

        // Notify student
        notificationService.send(submission.getStudent().getUser().getId(),
            Notification.NotificationType.SUCCESS,
            "Assignment Graded: " + submission.getAssignment().getTitle(),
            "Your assignment '" + submission.getAssignment().getTitle() + "' has been graded. " +
                "Marks: " + req.getMarks() + "/" + submission.getAssignment().getMaxMarks(),
            "SUBMISSION", submission.getId());

        return submission;
    }

    @Transactional(readOnly = true)
    public AssignmentSubmission getSubmission(Long submissionId) {
        return submissionRepository.findById(submissionId)
            .orElseThrow(() -> new ResourceNotFoundException("Submission", submissionId));
    }

    @Transactional(readOnly = true)
    public List<AssignmentSubmission> getStudentSubmissions(Long studentUserId) {
        Student student = studentRepository.findByUserId(studentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return submissionRepository.findByStudentId(student.getId());
    }
}
