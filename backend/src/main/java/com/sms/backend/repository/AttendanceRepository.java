package com.sms.backend.repository;

import com.sms.backend.entity.Attendance;
import com.sms.backend.entity.AttendanceSession;
import com.sms.backend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudentAndSession(Student student, AttendanceSession session);
    boolean existsByStudentIdAndSessionId(Long studentId, Long sessionId);
    List<Attendance> findByStudentId(Long studentId);

    @Query("SELECT a FROM Attendance a JOIN a.session s WHERE a.student.id = :studentId " +
           "AND s.subject.id = :subjectId ORDER BY s.sessionDate DESC")
    List<Attendance> findByStudentAndSubject(
        @Param("studentId") Long studentId,
        @Param("subjectId") Long subjectId);

    @Query("SELECT COUNT(a) FROM Attendance a JOIN a.session s " +
           "WHERE a.student.id = :studentId AND s.subject.id = :subjectId " +
           "AND a.status = 'PRESENT'")
    long countPresentByStudentAndSubject(@Param("studentId") Long studentId,
                                          @Param("subjectId") Long subjectId);

    @Query("SELECT COUNT(s) FROM AttendanceSession s WHERE s.subject.id = :subjectId " +
           "AND s.className = :className AND s.active = true")
    long countTotalSessionsBySubjectAndClass(@Param("subjectId") Long subjectId,
                                             @Param("className") String className);

    @Query("SELECT a FROM Attendance a WHERE a.session.id = :sessionId")
    List<Attendance> findBySessionId(@Param("sessionId") Long sessionId);

    // Admin filtered view
    @Query("SELECT a FROM Attendance a JOIN a.session s WHERE " +
           "(:studentId IS NULL OR a.student.id = :studentId) AND " +
           "(:subjectId IS NULL OR s.subject.id = :subjectId) AND " +
           "(:facultyId IS NULL OR s.faculty.id = :facultyId) AND " +
           "(:date IS NULL OR s.sessionDate = :date)")
    Page<Attendance> findAllWithFilters(
        @Param("studentId") Long studentId,
        @Param("subjectId") Long subjectId,
        @Param("facultyId") Long facultyId,
        @Param("date") LocalDate date,
        Pageable pageable);
}
