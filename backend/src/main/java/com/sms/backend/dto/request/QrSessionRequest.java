package com.sms.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class QrSessionRequest {
    @NotNull private Long subjectId;
    @NotBlank private String className;
    @NotNull private LocalDate sessionDate;
    @Min(1) @Max(120)
    private Integer expiryMinutes = 10;
}
