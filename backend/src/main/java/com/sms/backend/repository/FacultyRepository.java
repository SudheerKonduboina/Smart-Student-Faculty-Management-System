package com.sms.backend.repository;

import com.sms.backend.entity.Faculty;
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
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByUser(User user);
    Optional<Faculty> findByUserId(Long userId);
    boolean existsByFacultyCode(String facultyCode);

    @Query("SELECT f FROM Faculty f JOIN f.user u WHERE f.active = true AND " +
           "(:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "LOWER(f.facultyCode) LIKE LOWER(CONCAT('%',:search,'%'))) AND " +
           "(:departmentId IS NULL OR f.department.id = :departmentId)")
    Page<Faculty> findAllWithFilters(
        @Param("search") String search,
        @Param("departmentId") Long departmentId,
        Pageable pageable);

    List<Faculty> findByDepartmentIdAndActiveTrue(Long departmentId);
    long countByActive(Boolean active);
}
