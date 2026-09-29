package com.sms.backend.repository;

import com.sms.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND " +
           "(:read IS NULL OR n.readStatus = :read) ORDER BY n.createdAt DESC")
    Page<Notification> findByUserWithFilter(
        @Param("userId") Long userId,
        @Param("read") Boolean read,
        Pageable pageable);

    long countByUserIdAndReadStatusFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.readStatus = true WHERE n.user.id = :userId")
    void markAllReadForUser(@Param("userId") Long userId);

    // Attendance warning: check for unread warning for student+subject
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId " +
           "AND n.type = 'WARNING' AND n.relatedEntityType = 'SUBJECT' " +
           "AND n.relatedEntityId = :subjectId AND n.readStatus = false")
    Optional<Notification> findUnreadAttendanceWarning(
        @Param("userId") Long userId,
        @Param("subjectId") Long subjectId);
}
