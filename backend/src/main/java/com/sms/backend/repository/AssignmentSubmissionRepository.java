package com.sms.backend.repository;

import com.sms.backend.entity.AssignmentSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    boolean existsByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    List<AssignmentSubmission> findByStudentId(Long studentId);
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);

    @Query("SELECT s FROM AssignmentSubmission s WHERE s.assignment.id = :assignmentId AND " +
           "(:status IS NULL OR s.status = :status)")
    Page<AssignmentSubmission> findByAssignmentWithFilters(
        @Param("assignmentId") Long assignmentId,
        @Param("status") AssignmentSubmission.SubmissionStatus status,
        Pageable pageable);

    @Query("SELECT COUNT(s) FROM AssignmentSubmission s WHERE s.assignment.faculty.id = :facultyId " +
           "AND s.status <> 'GRADED'")
    long countPendingByFaculty(@Param("facultyId") Long facultyId);

    @Query("SELECT COUNT(s) FROM AssignmentSubmission s WHERE s.status = :status")
    long countByStatus(@Param("status") AssignmentSubmission.SubmissionStatus status);
}
