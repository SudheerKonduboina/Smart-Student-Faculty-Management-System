package com.sms.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class GradeRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @Min(0) @Max(100)
    private Double internalMarks;

    @Min(0) @Max(100)
    private Double assignmentMarks;

    @Min(0) @Max(100)
    private Double examMarks;
}
