package com.sms.backend.repository;

import com.sms.backend.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    List<Grade> findByStudentId(Long studentId);
    List<Grade> findByStudentIdAndPublishedTrue(Long studentId);
    List<Grade> findBySubjectId(Long subjectId);
    List<Grade> findBySubjectIdAndPublishedTrue(Long subjectId);

    @Query("SELECT g FROM Grade g WHERE g.subject.faculty.id = :facultyId")
    List<Grade> findByFacultyId(@Param("facultyId") Long facultyId);

    @Query("SELECT AVG(g.totalMarks) FROM Grade g WHERE g.subject.id = :subjectId AND g.published = true")
    Double avgMarksBySubject(@Param("subjectId") Long subjectId);

    @Query("SELECT g.grade, COUNT(g) FROM Grade g WHERE g.published = true GROUP BY g.grade")
    List<Object[]> gradeDistribution();
}
