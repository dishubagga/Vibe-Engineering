package com.example.common.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
  private String message;
  private int status;
  @Builder.Default
  private LocalDateTime timestamp = LocalDateTime.now();
  private String path;
  private String error;
}
