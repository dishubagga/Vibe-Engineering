package com.example.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
  @Size(min = 2, max = 100)
  private String name;

  @Pattern(regexp = "^[+]?[0-9]{10,15}$")
  private String phone;
}
