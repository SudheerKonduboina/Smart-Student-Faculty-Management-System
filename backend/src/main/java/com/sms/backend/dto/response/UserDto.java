package com.sms.backend.dto.response;

import com.sms.backend.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private User.Role role;
    private Boolean active;
    private LocalDateTime createdAt;
}
