package com.example.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
  private boolean success;
  private T data;
  private String message;
  private int code;
  @Builder.Default
  private LocalDateTime timestamp = LocalDateTime.now();

  public static <T> ApiResponse<T> ok(T data) {
    return ApiResponse.<T>builder()
        .success(true)
        .data(data)
        .code(200)
        .timestamp(LocalDateTime.now())
        .build();
  }

  public static <T> ApiResponse<T> created(T data) {
    return ApiResponse.<T>builder()
        .success(true)
        .data(data)
        .code(201)
        .timestamp(LocalDateTime.now())
        .build();
  }

  public static <T> ApiResponse<T> error(String message, int code) {
    return ApiResponse.<T>builder()
        .success(false)
        .message(message)
        .code(code)
        .timestamp(LocalDateTime.now())
        .build();
  }
}
