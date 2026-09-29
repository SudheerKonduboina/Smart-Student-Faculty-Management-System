package com.sms.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${python.service.url}")
    private String pythonServiceUrl;

    @Value("${python.service.internal-key}")
    private String internalKey;

    @Bean
    public WebClient pythonServiceWebClient() {
        return WebClient.builder()
                .baseUrl(pythonServiceUrl)
                .defaultHeader("X-Internal-Key", internalKey)
                .build();
    }
}
