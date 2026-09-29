package com.sms.backend.repository;

import com.sms.backend.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByFacultyIdOrderBySessionDateDesc(Long facultyId);
    List<AttendanceSession> findBySubjectIdOrderBySessionDateDesc(Long subjectId);
    List<AttendanceSession> findByClassNameAndSessionDateAndSubjectIdAndActiveTrue(
        String className, LocalDate date, Long subjectId);
    Optional<AttendanceSession> findByQrToken(String qrToken);

    @Query("SELECT s FROM AttendanceSession s WHERE s.faculty.id = :facultyId " +
           "AND s.sessionDate BETWEEN :start AND :end ORDER BY s.sessionDate DESC")
    List<AttendanceSession> findByFacultyAndDateRange(
        @Param("facultyId") Long facultyId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end);
}
