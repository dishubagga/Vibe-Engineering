package com.example.user.dto;

import lombok.*;
import com.example.user.entity.User;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
  private Long id;
  private String email;
  private String name;
  private String phone;
  private String status;
  private Integer age;
  private Double weightKg;
  private Double heightCm;
  private Boolean onboardingCompleted;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static UserDTO fromEntity(User user) {
    return UserDTO.builder()
        .id(user.getId())
        .email(user.getEmail())
        .name(user.getName())
        .phone(user.getPhone())
        .status(user.getStatus())
        .age(user.getAge())
        .weightKg(user.getWeightKg())
        .heightCm(user.getHeightCm())
        .onboardingCompleted(user.getOnboardingCompleted())
        .createdAt(user.getCreatedAt())
        .updatedAt(user.getUpdatedAt())
        .build();
  }
}
