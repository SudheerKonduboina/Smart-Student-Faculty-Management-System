package com.sms.backend.service;

import com.sms.backend.dto.request.GradeRequest;
import com.sms.backend.entity.*;
import com.sms.backend.exception.*;
import com.sms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final NotificationService notificationService;

    @Transactional
    public Grade saveGrade(Long facultyUserId, GradeRequest request) {
        Faculty faculty = facultyRepository.findByUserId(facultyUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        Student student = studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Student", request.getStudentId()));
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));

        // Validate faculty owns subject
        if (subject.getFaculty() != null && !subject.getFaculty().getId().equals(faculty.getId())) {
            throw new BadRequestException("You are not the assigned faculty for this subject");
        }

        double internal = request.getInternalMarks() != null ? request.getInternalMarks() : 0;
        double assignment = request.getAssignmentMarks() != null ? request.getAssignmentMarks() : 0;
        double exam = request.getExamMarks() != null ? request.getExamMarks() : 0;
        double total = internal + assignment + exam;
        String grade = computeGrade(total);

        var existing = gradeRepository.findByStudentIdAndSubjectId(student.getId(), subject.getId());
        Grade g;
        if (existing.isPresent()) {
            g = existing.get();
            g.setInternalMarks(internal);
            g.setAssignmentMarks(assignment);
            g.setExamMarks(exam);
            g.setTotalMarks(total);
            g.setGrade(grade);
        } else {
            g = Grade.builder()
                .student(student).subject(subject)
                .internalMarks(internal).assignmentMarks(assignment)
                .examMarks(exam).totalMarks(total).grade(grade)
                .published(false).build();
        }
        return gradeRepository.save(g);
    }

    @Transactional
    public Grade publishGrade(Long gradeId, Long facultyUserId) {
        Grade grade = gradeRepository.findById(gradeId)
            .orElseThrow(() -> new ResourceNotFoundException("Grade", gradeId));
        grade.setPublished(true);
        grade = gradeRepository.save(grade);

        // Notify student
        notificationService.send(grade.getStudent().getUser().getId(),
            Notification.NotificationType.SUCCESS,
            "Grade Published: " + grade.getSubject().getName(),
            "Your grade for " + grade.getSubject().getName() + " has been published. " +
                "Total: " + grade.getTotalMarks() + " | Grade: " + grade.getGrade(),
            "GRADE", grade.getId());
        return grade;
    }

    @Transactional(readOnly = true)
    public List<Grade> getStudentGrades(Long studentUserId, boolean studentCalling) {
        Student student = studentRepository.findByUserId(studentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (studentCalling) {
            return gradeRepository.findByStudentIdAndPublishedTrue(student.getId());
        }
        return gradeRepository.findByStudentId(student.getId());
    }

    @Transactional(readOnly = true)
    public List<Grade> getSubjectGrades(Long subjectId, Long facultyUserId) {
        Faculty faculty = facultyRepository.findByUserId(facultyUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        return gradeRepository.findBySubjectId(subjectId);
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
}
