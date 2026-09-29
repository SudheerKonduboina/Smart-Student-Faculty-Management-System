package com.sms.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class GradeSubmissionRequest {
    private Double marks;

    private Double marksObtained;

    private String feedback;

    public Double getMarks() {
        return marks != null ? marks : marksObtained;
    }
}
