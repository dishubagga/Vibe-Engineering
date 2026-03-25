package com.example.common.config;

import com.example.common.dto.ApiResponse;
import com.example.common.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
      ResourceNotFoundException ex, WebRequest request) {
    log.warn("Resource not found: {}", ex.getMessage());
    ApiResponse<Void> error = ApiResponse.error(ex.getMessage(), 404);
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
  }

  @ExceptionHandler(DuplicateResourceException.class)
  public ResponseEntity<ApiResponse<Void>> handleDuplicateResource(
      DuplicateResourceException ex, WebRequest request) {
    log.warn("Duplicate resource: {}", ex.getMessage());
    ApiResponse<Void> error = ApiResponse.error(ex.getMessage(), 409);
    return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ApiResponse<Void>> handleBadCredentials(
      BadCredentialsException ex, WebRequest request) {
    log.warn("Bad credentials: {}", ex.getMessage());
    ApiResponse<Void> error = ApiResponse.error("Invalid credentials", 401);
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidationError(
      MethodArgumentNotValidException ex, WebRequest request) {
    String message = ex.getBindingResult()
        .getFieldError()
        .getDefaultMessage();
    log.warn("Validation error: {}", message);
    ApiResponse<Void> error = ApiResponse.error("Validation failed: " + message, 400);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleGlobalException(
      Exception ex, WebRequest request) {
    log.error("Unexpected error", ex);
    ApiResponse<Void> error = ApiResponse.error("Internal Server Error", 500);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
  }
}
