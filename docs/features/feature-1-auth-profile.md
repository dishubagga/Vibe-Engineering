# Feature Plan: User Authentication & Profile Setup

## Overview
Secure JWT-based auth (register/login) + multi-step onboarding wizard to capture fitness goals and macro targets. Foundation for all other NutriCoach features.

---

## What Already Exists (Reuse / Extend)

### Backend
- `User` entity — has email, name, password, status ✅ — **needs**: age, weightKg, heightCm, onboardingCompleted
- `UserService` — createUser, updateUser ✅ — **needs**: findByEmail for auth
- `UserRepository` — existsByEmail ✅
- `SecurityConfig` — BCrypt bean ✅ — **needs**: full Spring Security filter chain + JWT
- `pom.xml` — JJWT 0.12.3 already included ✅

### Frontend
- `authSlice` — loginSuccess/logout/loginStart reducers ✅
- `api.js` — Bearer token interceptor + 401 redirect ✅
- `store` — auth + user reducers wired ✅

---

## Backend Tasks

### 1. Extend `User` Entity
Add to `com/example/user/entity/User.java`:
- `Integer age`
- `Double weightKg`
- `Double heightCm`
- `Boolean onboardingCompleted` (default false)

### 2. New `UserGoal` Entity
Create `com/example/user/entity/UserGoal.java`:
- `id` (PK)
- `userId` (FK → users.id, unique — 1:1)
- `goalType` enum: `FAT_LOSS`, `MUSCLE_GAIN`, `MAINTENANCE`
- `dailyCalories` Integer
- `dailyProteinG` Integer
- `dailyCarbsG` Integer
- `dailyFatG` Integer
- `createdAt`, `updatedAt`

### 3. JWT Utility
Create `com/example/auth/util/JwtUtil.java`:
- `generateToken(String email)` → signs with HS256, 24hr expiry, from `app.jwt.secret`
- `validateToken(String token)` → returns boolean
- `extractEmail(String token)` → returns subject

### 4. JWT Filter
Create `com/example/auth/filter/JwtAuthFilter.java` extends `OncePerRequestFilter`:
- Reads `Authorization: Bearer <token>` header
- Validates token, loads `UserDetails`, sets `SecurityContextHolder`

### 5. Spring Security Config (replace existing stub)
Update `com/example/config/SecurityConfig.java`:
- Add `SecurityFilterChain` bean
- Permit: `POST /api/auth/**`
- Authenticate: all other `/api/**`
- Stateless session, add `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`
- Add `AuthenticationManager` bean
- Keep existing BCrypt + CORS beans

### 6. `UserDetailsService` Implementation
Create `com/example/auth/service/CustomUserDetailsService.java`:
- Implements Spring's `UserDetailsService`
- Loads user by email from `UserRepository`

### 7. Auth DTOs
Create in `com/example/auth/dto/`:
- `RegisterRequest` — email, password, name
- `LoginRequest` — email, password
- `AuthResponse` — token, userId, email, name, onboardingCompleted

### 8. `AuthService`
Create `com/example/auth/service/AuthService.java`:
- `register(RegisterRequest)` → creates User, returns `AuthResponse`
- `login(LoginRequest)` → authenticates, returns `AuthResponse` with JWT

### 9. `AuthController`
Create `com/example/auth/controller/AuthController.java`:
- `POST /api/auth/register` → `AuthResponse`
- `POST /api/auth/login` → `AuthResponse`

### 10. User Profile & Onboarding
Update `com/example/user/dto/UpdateUserRequest.java` to include: age, weightKg, heightCm.
Create `com/example/user/dto/OnboardingRequest.java` — age, weightKg, heightCm, goalType, dailyCalories, dailyProteinG, dailyCarbsG, dailyFatG.

Update `UserController`:
- `GET /api/users/me` → returns current user from JWT (replace id-based)
- `PUT /api/users/me` → update profile fields
- `POST /api/users/me/onboarding` → saves UserGoal, sets onboardingCompleted=true

Update `UserService` to support the above.

### 11. `application.yml` (dev)
Add:
```yaml
app:
  jwt:
    secret: <256-bit-hex-secret>
    expiration: 86400000
```

---

## Frontend Tasks

### 1. Auth Service
Create `src/services/authService.js`:
- `register(email, password, name)` → POST `/api/auth/register`
- `login(email, password)` → POST `/api/auth/login`

### 2. User Service
Create `src/services/userService.js`:
- `getMe()` → GET `/api/users/me`
- `updateProfile(data)` → PUT `/api/users/me`
- `completeOnboarding(data)` → POST `/api/users/me/onboarding`

### 3. Auth Store (update `authSlice`)
Add:
- `setUser(user)` action to store user profile
- `onboardingCompleted` flag in state

### 4. `ProtectedRoute` Component
Create `src/components/ProtectedRoute.jsx`:
- If not authenticated → redirect to `/login`
- If authenticated but `!onboardingCompleted` → redirect to `/onboarding`
- Otherwise → render children

### 5. `LoginPage`
Create `src/pages/LoginPage.jsx`:
- Email + password form
- Calls `authService.login()`, dispatches `loginSuccess`
- Redirects to `/` on success
- Shows inline error on failure
- Link to `/register`

### 6. `RegisterPage`
Create `src/pages/RegisterPage.jsx`:
- Name, email, password, confirm password fields
- Password strength indicator
- Calls `authService.register()`, auto-login on success
- Redirects to `/onboarding`
- Link to `/login`

### 7. `OnboardingFlow`
Create `src/pages/OnboardingFlow.jsx` — 3-step wizard:
- **Step 1** — Personal details: age, weight (kg), height (cm)
- **Step 2** — Fitness goal: Fat Loss / Muscle Gain / Maintenance (card selection)
- **Step 3** — Macro targets: auto-suggested based on goal + profile, or manual override. Shows calories, protein, carbs, fat sliders/inputs.
- Calls `userService.completeOnboarding()` on submit
- Redirects to `/` on success

### 8. `ProfilePage`
Create `src/pages/ProfilePage.jsx`:
- Displays: name, email, age, weight, height, goal
- Edit mode: inline form with save
- "Change Goals" section to re-trigger macro target update
- Logout button

### 9. Update `App.jsx`
- Add routes: `/login`, `/register`, `/onboarding`, `/profile`
- Wrap dashboard and protected pages in `<ProtectedRoute>`

---

## Database Schema Changes

```sql
-- Extend users table
ALTER TABLE users ADD COLUMN age INTEGER;
ALTER TABLE users ADD COLUMN weight_kg DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN height_cm DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;

-- New user_goals table
CREATE TABLE user_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(20) NOT NULL,        -- FAT_LOSS, MUSCLE_GAIN, MAINTENANCE
  daily_calories INTEGER,
  daily_protein_g INTEGER,
  daily_carbs_g INTEGER,
  daily_fat_g INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP
);
```

_(Spring Boot with `ddl-auto: update` will handle this automatically in dev)_

---

## Macro Auto-Suggestion Logic

On Step 3 of onboarding, suggest targets based on goal:

| Goal | Calories | Protein | Carbs | Fat |
|---|---|---|---|---|
| Fat Loss | TDEE - 500 | 2.2g × weight(kg) | remaining / 4 | 0.8g × weight(kg) |
| Muscle Gain | TDEE + 300 | 2.0g × weight(kg) | remaining / 4 | 1.0g × weight(kg) |
| Maintenance | TDEE | 1.8g × weight(kg) | remaining / 4 | 0.9g × weight(kg) |

_TDEE = BMR × 1.55 (Mifflin-St Jeor formula)_
_This is calculated frontend-side from age, weight, height and displayed as suggestions — user can override._

---

## Edge Cases & Error Scenarios

| Scenario | Handling |
|---|---|
| Duplicate email on register | `DuplicateResourceException` → 409 → "Email already in use" |
| Wrong password on login | `BadCredentialsException` → 401 → "Invalid credentials" |
| Expired JWT | `JwtAuthFilter` rejects → 401 → frontend redirects to `/login` |
| Malformed JWT | Caught in filter, request rejected as 401 |
| Onboarding skipped | `ProtectedRoute` redirects back to `/onboarding` until complete |
| Re-submit onboarding | `UserGoal` upsert (update if exists) |
| Invalid macro values | Frontend validation (positive integers, calories < 10000) |

---

## Validation Rules

### Backend
- Email: `@Email`, `@NotBlank`, unique in DB
- Password: `@NotBlank`, `@Size(min=8)`
- Name: `@NotBlank`, `@Size(min=2, max=100)`
- Age: `@Min(13)`, `@Max(120)`
- Weight: `@DecimalMin("30.0")`, `@DecimalMax("300.0")`
- Height: `@DecimalMin("100.0")`, `@DecimalMax("250.0")`
- goalType: `@NotNull`, must be valid enum value

### Frontend
- Confirm password matches password
- All onboarding fields required before proceeding to next step
- Macro targets: all positive integers

---

## API Endpoints Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/users/me` | JWT | Get current user profile |
| PUT | `/api/users/me` | JWT | Update profile (name, age, weight, height) |
| POST | `/api/users/me/onboarding` | JWT | Save goals, mark onboarding complete |

---

## File Creation Summary

### New Backend Files
```
backend/src/main/java/com/example/
├── auth/
│   ├── controller/AuthController.java
│   ├── service/AuthService.java
│   ├── service/CustomUserDetailsService.java
│   ├── filter/JwtAuthFilter.java
│   ├── util/JwtUtil.java
│   └── dto/
│       ├── RegisterRequest.java
│       ├── LoginRequest.java
│       └── AuthResponse.java
└── user/
    ├── entity/UserGoal.java            (new)
    ├── entity/GoalType.java            (new enum)
    ├── dto/OnboardingRequest.java      (new)
    └── repository/UserGoalRepository.java (new)
```

### Modified Backend Files
```
user/entity/User.java          — add age, weightKg, heightCm, onboardingCompleted
user/service/UserService.java  — add findByEmail, /me endpoints, onboarding logic
user/controller/UserController.java — replace id-based with JWT-principal-based /me
config/SecurityConfig.java     — full Spring Security filter chain
resources/application.yml      — add jwt secret + expiration
```

### New Frontend Files
```
frontend/src/
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── OnboardingFlow.jsx
│   └── ProfilePage.jsx
├── components/
│   └── ProtectedRoute.jsx
└── services/
    ├── authService.js
    └── userService.js
```

### Modified Frontend Files
```
App.jsx              — add auth routes, wrap with ProtectedRoute
store/slices/authSlice.js — add setUser, onboardingCompleted
```

---

## Dependencies (No New Installs Needed)

- **Backend**: JJWT 0.12.3 already in `pom.xml`, Spring Security already included
- **Frontend**: React Router, Redux Toolkit, axios all already installed

---

## Next Step

Once confirmed, run:
```
/build-backend Feature 1: Auth & Profile (backend)
/build-frontend Feature 1: Auth & Profile (frontend)
```
