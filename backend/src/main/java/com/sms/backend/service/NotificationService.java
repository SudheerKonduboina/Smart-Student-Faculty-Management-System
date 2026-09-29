package com.sms.backend.service;

import com.sms.backend.entity.Notification;
import com.sms.backend.entity.User;
import com.sms.backend.exception.ResourceNotFoundException;
import com.sms.backend.repository.NotificationRepository;
import com.sms.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void send(Long userId, Notification.NotificationType type, String title, String message,
                     String entityType, Long entityId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        Notification n = Notification.builder()
            .user(user).type(type).title(title).message(message)
            .relatedEntityType(entityType).relatedEntityId(entityId)
            .readStatus(false).build();
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public Page<Notification> getNotifications(Long userId, Boolean read, Pageable pageable) {
        return notificationRepository.findByUserWithFilter(userId, read, pageable);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadStatusFalse(userId);
    }

    @Transactional
    public Notification markRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!n.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", notificationId);
        }
        n.setReadStatus(true);
        return notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    @Transactional
    public void delete(Long id) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        notificationRepository.delete(n);
    }

    @Transactional
    public void checkAndSendAttendanceWarning(Long userId, Long subjectId, String subjectName,
                                               long present, long total, double threshold) {
        if (total == 0) return;
        double pct = (present * 100.0) / total;
        if (pct < threshold) {
            // Check if unread warning already exists
            boolean alreadyWarned = notificationRepository
                .findUnreadAttendanceWarning(userId, subjectId).isPresent();
            if (!alreadyWarned) {
                send(userId, Notification.NotificationType.WARNING,
                    "⚠ Low Attendance Warning",
                    String.format("Your attendance in %s is %.1f%%, which is below the required %.0f%%. Please attend classes regularly.",
                        subjectName, pct, threshold),
                    "SUBJECT", subjectId);
            }
        }
    }
}
