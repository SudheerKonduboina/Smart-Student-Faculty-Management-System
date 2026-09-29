package com.sms.backend.dto.response;

import com.sms.backend.entity.User;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StudentDto {
    private Long id;
    private String studentCode;
    private Integer semester;
    private LocalDate enrollmentDate;
    private Boolean active;
    private LocalDateTime createdAt;
    // User fields
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    // Department
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
}
