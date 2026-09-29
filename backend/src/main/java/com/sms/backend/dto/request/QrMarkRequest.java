package com.sms.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class QrMarkRequest {
    @NotBlank(message = "QR token is required")
    private String token;
}
