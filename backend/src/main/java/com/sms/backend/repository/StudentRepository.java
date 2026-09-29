package com.sms.backend.repository;

import com.sms.backend.entity.Student;
import com.sms.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);
    boolean existsByStudentCode(String studentCode);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE s.active = true AND " +
           "(:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "LOWER(s.studentCode) LIKE LOWER(CONCAT('%',:search,'%'))) AND " +
           "(:departmentId IS NULL OR s.department.id = :departmentId) AND " +
           "(:semester IS NULL OR s.semester = :semester)")
    Page<Student> findAllWithFilters(
        @Param("search") String search,
        @Param("departmentId") Long departmentId,
        @Param("semester") Integer semester,
        Pageable pageable);

    List<Student> findByDepartmentIdAndActiveTrue(Long departmentId);
    List<Student> findByDepartmentIdAndSemesterAndActiveTrue(Long departmentId, Integer semester);
    long countByActive(Boolean active);
}
