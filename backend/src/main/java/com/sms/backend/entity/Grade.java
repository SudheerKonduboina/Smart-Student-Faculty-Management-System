package com.sms.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "grades",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_student_subject",
        columnNames = {"student_id", "subject_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "internal_marks")
    private Double internalMarks;

    @Column(name = "assignment_marks")
    private Double assignmentMarks;

    @Column(name = "exam_marks")
    private Double examMarks;

    @Column(name = "total_marks")
    private Double totalMarks;

    @Column(length = 5)
    private String grade;

    @Column(nullable = false)
    @Builder.Default
    private Boolean published = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
