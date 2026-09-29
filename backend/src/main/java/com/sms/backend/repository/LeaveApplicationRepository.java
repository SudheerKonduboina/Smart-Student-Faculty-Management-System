package com.sms.backend.repository;

import com.sms.backend.entity.LeaveApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    @Query("SELECT l FROM LeaveApplication l WHERE " +
           "(:studentId IS NULL OR l.student.id = :studentId) AND " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:departmentId IS NULL OR l.student.department.id = :departmentId)")
    Page<LeaveApplication> findAllWithFilters(
        @Param("studentId") Long studentId,
        @Param("status") LeaveApplication.LeaveStatus status,
        @Param("departmentId") Long departmentId,
        Pageable pageable);

    long countByStatus(LeaveApplication.LeaveStatus status);
}
