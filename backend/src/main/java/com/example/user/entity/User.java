package com.example.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  @Email(message = "Email should be valid")
  @NotBlank(message = "Email is required")
  private String email;

  @Column(nullable = false)
  @NotBlank(message = "Name is required")
  @Size(min = 2, max = 100)
  private String name;

  @Column(length = 20)
  @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number is invalid")
  private String phone;

  @Column(nullable = false)
  @NotBlank(message = "Password is required")
  private String password;

  @Column(length = 50)
  @Builder.Default
  private String status = "ACTIVE";

  private Integer age;

  private Double weightKg;

  private Double heightCm;

  @Column(nullable = false)
  @Builder.Default
  private Boolean onboardingCompleted = false;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    if (status == null) {
      status = "ACTIVE";
    }
  }
}
