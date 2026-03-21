package com.example.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
  @Email(message = "Email must be valid")
  @NotBlank(message = "Email is required")
  private String email;

  @NotBlank(message = "Name is required")
  @Size(min = 2, max = 100)
  private String name;

  @NotBlank(message = "Password is required")
  @Size(min = 8, message = "Password must be at least 8 characters")
  private String password;

  @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number is invalid")
  private String phone;
}
