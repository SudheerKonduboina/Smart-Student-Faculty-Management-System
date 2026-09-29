package com.sms.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class AssignmentRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotBlank(message = "Class name is required")
    private String className;

    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be in the future")
    private LocalDate dueDate;

    @Min(value = 1, message = "Max marks must be at least 1")
    @Max(value = 1000, message = "Max marks cannot exceed 1000")
    private Integer maxMarks = 100;
}
