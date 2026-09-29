package com.sms.backend.repository;

import com.sms.backend.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByActiveTrue();
    List<Timetable> findByFacultyIdAndActiveTrue(Long facultyId);
    List<Timetable> findByClassNameAndActiveTrue(String className);
    List<Timetable> findBySubjectIdAndActiveTrue(Long subjectId);

    // Faculty conflict: same faculty, day, overlapping time (excluding self)
    @Query("SELECT COUNT(t) FROM Timetable t WHERE t.faculty.id = :facultyId " +
           "AND t.dayOfWeek = :day AND t.id <> :excludeId AND t.active = true " +
           "AND t.startTime < :endTime AND t.endTime > :startTime")
    long countFacultyConflicts(@Param("facultyId") Long facultyId,
                               @Param("day") Timetable.DayOfWeek day,
                               @Param("startTime") LocalTime startTime,
                               @Param("endTime") LocalTime endTime,
                               @Param("excludeId") Long excludeId);

    // Room conflict
    @Query("SELECT COUNT(t) FROM Timetable t WHERE t.room = :room " +
           "AND t.dayOfWeek = :day AND t.id <> :excludeId AND t.active = true " +
           "AND t.startTime < :endTime AND t.endTime > :startTime")
    long countRoomConflicts(@Param("room") String room,
                            @Param("day") Timetable.DayOfWeek day,
                            @Param("startTime") LocalTime startTime,
                            @Param("endTime") LocalTime endTime,
                            @Param("excludeId") Long excludeId);

    // Class conflict
    @Query("SELECT COUNT(t) FROM Timetable t WHERE t.className = :className " +
           "AND t.dayOfWeek = :day AND t.id <> :excludeId AND t.active = true " +
           "AND t.startTime < :endTime AND t.endTime > :startTime")
    long countClassConflicts(@Param("className") String className,
                             @Param("day") Timetable.DayOfWeek day,
                             @Param("startTime") LocalTime startTime,
                             @Param("endTime") LocalTime endTime,
                             @Param("excludeId") Long excludeId);
}
