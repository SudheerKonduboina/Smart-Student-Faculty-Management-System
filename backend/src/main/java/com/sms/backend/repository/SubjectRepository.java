package com.sms.backend.repository;

import com.sms.backend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    boolean existsByCode(String code);
    List<Subject> findByActiveTrue();
    List<Subject> findByDepartmentIdAndActiveTrue(Long departmentId);
    List<Subject> findByFacultyIdAndActiveTrue(Long facultyId);

    @Query("SELECT COUNT(s) > 0 FROM Subject s JOIN Timetable t ON t.subject.id = s.id " +
           "WHERE s.id = :subjectId AND t.active = true")
    boolean hasActiveTimetable(@Param("subjectId") Long subjectId);
}
