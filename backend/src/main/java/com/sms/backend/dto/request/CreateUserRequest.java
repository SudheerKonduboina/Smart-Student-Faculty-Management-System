package com.sms.backend.dto.request;

import com.sms.backend.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateUserRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String phone;

    @NotNull(message = "Role is required")
    private User.Role role;

    // For STUDENT
    private Long departmentId;
    private Integer semester;
    private LocalDate enrollmentDate;

    // For FACULTY
    private LocalDate joinedDate;
}
