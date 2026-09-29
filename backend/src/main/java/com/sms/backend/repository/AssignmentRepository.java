package com.sms.backend.repository;

import com.sms.backend.entity.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByFacultyIdAndActiveTrue(Long facultyId);
    List<Assignment> findBySubjectIdAndActiveTrue(Long subjectId);

    @Query("SELECT a FROM Assignment a WHERE a.active = true AND " +
           "(:subjectId IS NULL OR a.subject.id = :subjectId) AND " +
           "(:facultyId IS NULL OR a.faculty.id = :facultyId) AND " +
           "(:className IS NULL OR a.className = :className)")
    Page<Assignment> findAllWithFilters(
        @Param("subjectId") Long subjectId,
        @Param("facultyId") Long facultyId,
        @Param("className") String className,
        Pageable pageable);

    @Query("SELECT a FROM Assignment a WHERE a.active = true AND " +
           "a.subject.department.id = :departmentId")
    List<Assignment> findByDepartmentId(@Param("departmentId") Long departmentId);

    long countByActiveTrue();
}
