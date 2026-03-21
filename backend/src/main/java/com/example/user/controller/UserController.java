package com.example.user.controller;

import com.example.user.dto.*;
import com.example.user.service.UserService;
import com.example.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {

  private final UserService userService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
    List<UserDTO> users = userService.getAllUsers();
    return ResponseEntity.ok(ApiResponse.ok(users));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
    UserDTO user = userService.getUserById(id);
    return ResponseEntity.ok(ApiResponse.ok(user));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<UserDTO>> createUser(
      @Valid @RequestBody CreateUserRequest request) {
    UserDTO user = userService.createUser(request);
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ApiResponse.created(user));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<UserDTO>> updateUser(
      @PathVariable Long id,
      @Valid @RequestBody UpdateUserRequest request) {
    UserDTO user = userService.updateUser(id, request);
    return ResponseEntity.ok(ApiResponse.ok(user));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}
