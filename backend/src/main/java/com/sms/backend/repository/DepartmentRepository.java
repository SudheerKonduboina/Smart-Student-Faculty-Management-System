package com.sms.backend.repository;

import com.sms.backend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByActiveTrue();
    boolean existsByCode(String code);
    boolean existsByName(String name);

    @Query("SELECT COUNT(s) > 0 FROM Student s WHERE s.department.id = :deptId AND s.active = true")
    boolean hasActiveStudents(Long deptId);

    @Query("SELECT COUNT(f) > 0 FROM Faculty f WHERE f.department.id = :deptId AND f.active = true")
    boolean hasActiveFaculty(Long deptId);
}
