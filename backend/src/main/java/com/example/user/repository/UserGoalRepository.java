package com.example.user.repository;

import com.example.user.entity.UserGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserGoalRepository extends JpaRepository<UserGoal, Long> {
    Optional<UserGoal> findByUserId(Long userId);
}
