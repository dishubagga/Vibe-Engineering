package com.example.user.dto;

import com.example.user.entity.GoalType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingRequest {

    @NotNull(message = "Age is required")
    @Min(value = 13, message = "Age must be at least 13")
    @Max(value = 120, message = "Age must be at most 120")
    private Integer age;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "30.0", message = "Weight must be at least 30 kg")
    @DecimalMax(value = "300.0", message = "Weight must be at most 300 kg")
    private Double weightKg;

    @NotNull(message = "Height is required")
    @DecimalMin(value = "100.0", message = "Height must be at least 100 cm")
    @DecimalMax(value = "250.0", message = "Height must be at most 250 cm")
    private Double heightCm;

    @NotNull(message = "Goal type is required")
    private GoalType goalType;

    @NotNull(message = "Daily calories is required")
    @Min(value = 500, message = "Daily calories must be at least 500")
    private Integer dailyCalories;

    @NotNull(message = "Daily protein is required")
    @Min(value = 0, message = "Daily protein must be non-negative")
    private Integer dailyProteinG;

    @NotNull(message = "Daily carbs is required")
    @Min(value = 0, message = "Daily carbs must be non-negative")
    private Integer dailyCarbsG;

    @NotNull(message = "Daily fat is required")
    @Min(value = 0, message = "Daily fat must be non-negative")
    private Integer dailyFatG;
}
