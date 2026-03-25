package com.example.user.service;

import com.example.user.dto.*;
import com.example.user.entity.User;
import com.example.user.entity.UserGoal;
import com.example.user.repository.UserGoalRepository;
import com.example.user.repository.UserRepository;
import com.example.common.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserService {

  private final UserRepository userRepository;
  private final UserGoalRepository userGoalRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional(readOnly = true)
  public List<UserDTO> getAllUsers() {
    List<User> users = userRepository.findAll();
    log.info("Retrieved {} users", users.size());
    return users.stream().map(UserDTO::fromEntity).toList();
  }

  @Transactional(readOnly = true)
  public UserDTO getUserById(Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            String.format("User with id %d not found", id)
        ));
    return UserDTO.fromEntity(user);
  }

  @Transactional(readOnly = true)
  public UserDTO getUserByEmail(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    return UserDTO.fromEntity(user);
  }

  public UserDTO createUser(CreateUserRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new DuplicateResourceException("Email already registered");
    }

    User user = new User();
    user.setEmail(request.getEmail());
    user.setName(request.getName());
    user.setPhone(request.getPhone());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setStatus("ACTIVE");

    User saved = userRepository.save(user);
    log.info("User created with id: {}", saved.getId());

    return UserDTO.fromEntity(saved);
  }

  public UserDTO updateMe(String email, UpdateUserRequest request) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (request.getName() != null) {
      user.setName(request.getName());
    }
    if (request.getPhone() != null) {
      user.setPhone(request.getPhone());
    }

    User updated = userRepository.save(user);
    log.info("User {} updated profile", email);
    return UserDTO.fromEntity(updated);
  }

  public UserDTO updateUser(Long id, UpdateUserRequest request) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            String.format("User with id %d not found", id)
        ));

    if (request.getName() != null) {
      user.setName(request.getName());
    }
    if (request.getPhone() != null) {
      user.setPhone(request.getPhone());
    }

    User updated = userRepository.save(user);
    log.info("User {} updated", id);

    return UserDTO.fromEntity(updated);
  }

  public void completeOnboarding(String email, OnboardingRequest request) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    user.setAge(request.getAge());
    user.setWeightKg(request.getWeightKg());
    user.setHeightCm(request.getHeightCm());
    user.setOnboardingCompleted(true);
    userRepository.save(user);

    UserGoal goal = userGoalRepository.findByUserId(user.getId())
        .orElse(UserGoal.builder().user(user).build());

    goal.setGoalType(request.getGoalType());
    goal.setDailyCalories(request.getDailyCalories());
    goal.setDailyProteinG(request.getDailyProteinG());
    goal.setDailyCarbsG(request.getDailyCarbsG());
    goal.setDailyFatG(request.getDailyFatG());
    userGoalRepository.save(goal);

    log.info("User {} completed onboarding with goal: {}", email, request.getGoalType());
  }

  public void deleteUser(Long id) {
    if (!userRepository.existsById(id)) {
      throw new ResourceNotFoundException(
          String.format("User with id %d not found", id)
      );
    }
    userRepository.deleteById(id);
    log.info("User {} deleted", id);
  }
}
