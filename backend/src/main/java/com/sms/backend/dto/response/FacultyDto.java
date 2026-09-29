package com.sms.backend.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FacultyDto {
    private Long id;
    private String facultyCode;
    private LocalDate joinedDate;
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
