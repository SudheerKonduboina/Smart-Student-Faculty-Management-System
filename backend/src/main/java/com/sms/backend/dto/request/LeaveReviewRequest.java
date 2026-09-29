package com.sms.backend.dto.request;

import com.sms.backend.entity.LeaveApplication;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class LeaveReviewRequest {
    @NotNull(message = "Status is required")
    private LeaveApplication.LeaveStatus status;
    private String comment;
}
