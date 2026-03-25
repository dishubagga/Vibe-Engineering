package com.example.auth.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String email;
    private String name;
    private boolean onboardingCompleted;
}
