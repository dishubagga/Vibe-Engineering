package com.example.user.controller;

import com.example.user.dto.*;
import com.example.user.service.UserService;
import com.example.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserDTO>> getMe(
      @AuthenticationPrincipal UserDetails userDetails) {
    UserDTO user = userService.getUserByEmail(userDetails.getUsername());
    return ResponseEntity.ok(ApiResponse.ok(user));
  }

  @PutMapping("/me")
  public ResponseEntity<ApiResponse<UserDTO>> updateMe(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody UpdateUserRequest request) {
    UserDTO user = userService.updateMe(userDetails.getUsername(), request);
    return ResponseEntity.ok(ApiResponse.ok(user));
  }

  @PostMapping("/me/onboarding")
  public ResponseEntity<ApiResponse<Void>> completeOnboarding(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody OnboardingRequest request) {
    userService.completeOnboarding(userDetails.getUsername(), request);
    return ResponseEntity.ok(ApiResponse.<Void>builder()
        .success(true)
        .message("Onboarding completed")
        .code(200)
        .build());
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
    List<UserDTO> users = userService.getAllUsers();
    return ResponseEntity.ok(ApiResponse.ok(users));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
    UserDTO user = userService.getUserById(id);
    return ResponseEntity.ok(ApiResponse.ok(user));
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<UserDTO>> createUser(
      @Valid @RequestBody CreateUserRequest request) {
    UserDTO user = userService.createUser(request);
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ApiResponse.created(user));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<UserDTO>> updateUser(
      @PathVariable Long id,
      @Valid @RequestBody UpdateUserRequest request) {
    UserDTO user = userService.updateUser(id, request);
    return ResponseEntity.ok(ApiResponse.ok(user));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}
