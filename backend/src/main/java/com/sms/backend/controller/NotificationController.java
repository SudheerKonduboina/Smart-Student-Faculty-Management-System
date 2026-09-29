package com.sms.backend.controller;

import com.sms.backend.dto.response.ApiResponse;
import com.sms.backend.entity.Notification;
import com.sms.backend.repository.UserRepository;
import com.sms.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getNotifications(
            @RequestParam(required = false) Boolean read,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.getNotifications(userId, read, PageRequest.of(page, size))));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.getUnreadCount(getUserId(auth))));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Object>> markRead(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.markRead(id, getUserId(auth))));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(Authentication auth) {
        notificationService.markAllRead(getUserId(auth));
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    // Admin broadcast
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> broadcast(@RequestBody Map<String, Object> body,
                                                         Authentication auth) {
        String type = (String) body.getOrDefault("type", "INFO");
        String title = (String) body.get("title");
        String message = (String) body.get("message");
        Long targetUserId = body.get("userId") != null ? ((Number) body.get("userId")).longValue() : null;

        if (targetUserId != null) {
            notificationService.send(targetUserId,
                Notification.NotificationType.valueOf(type), title, message, "ADMIN", null);
        } else {
            // Broadcast to all active users
            userRepository.findAll().stream()
                .filter(u -> u.getActive())
                .forEach(u -> notificationService.send(u.getId(),
                    Notification.NotificationType.valueOf(type), title, message, "ADMIN", null));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Notification sent"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted"));
    }

    private Long getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow().getId();
    }
}
