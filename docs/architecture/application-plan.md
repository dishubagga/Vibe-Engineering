# Application Architecture Plan: NutriCoach AI

## Core Idea & Architecture

**NutriCoach AI** is a mobile-first nutrition tracking web application powered by AI. Users log meals via text, image upload, or barcode scan. An AI engine automatically parses and calculates macronutrients (calories, protein, carbs, fat). A daily dashboard tracks intake vs. personalized goals, and an AI chat assistant provides real-time dietary coaching based on the user's fitness objective.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.2.0 + Vite, Tailwind CSS, React Router v6 |
| State Management | Zustand (lightweight, ideal for mobile-first UX) |
| Backend | Spring Boot 3.2.0, Java 17 |
| AI Integration | Claude API (meal parsing + chat assistant) |
| Database | PostgreSQL + Spring Data JPA |
| Auth | Spring Security + JWT |
| File Storage | Local / S3-compatible (image uploads) |
| Build | Maven 3.9.x |

### High-Level Data Flow

```
User → React App → Spring Boot REST API → PostgreSQL
                 ↘ Claude AI API (meal parsing, chat)
                 ↘ Barcode/OCR Service (food scan)
```

---

## Feature Roadmap

---

### Feature 1: User Authentication & Profile Setup
**Goal**: Secure user registration/login and onboarding to capture fitness goals.

- **Frontend**:
  - `RegisterPage` — email/password sign-up form
  - `LoginPage` — JWT login flow
  - `OnboardingFlow` — multi-step wizard to capture:
    - Name, age, weight, height
    - Fitness goal: Fat Loss / Muscle Gain / Maintenance
    - Daily macro targets (auto-suggested or manual)
  - `ProfilePage` — view/edit profile and goals
  - `ProtectedRoute` — auth guard wrapper component

- **Backend**:
  - `AuthController` — `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`
  - `UserController` — `/api/users/me`, `/api/users/profile`
  - `AuthService` — JWT generation, password hashing (BCrypt)
  - `UserService` — CRUD for user profile
  - `JwtFilter` — Spring Security filter chain
  - `User` entity + `UserGoal` entity

---

### Feature 2: Meal Logging (Text Input)
**Goal**: Allow users to log meals by typing natural language and auto-calculate macros via AI.

- **Frontend**:
  - `MealLogPage` — main logging screen
  - `TextMealInput` — free-text input (e.g., "2 eggs and a bowl of oatmeal")
  - `MacroPreviewCard` — shows AI-parsed macros before confirming
  - `MealConfirmModal` — edit/confirm parsed meal entry
  - `MealList` — chronological log of today's meals

- **Backend**:
  - `MealController` — `/api/meals` (POST, GET, DELETE)
  - `MealParsingService` — sends text to Claude API, parses structured macro response
  - `ClaudeApiClient` — HTTP client wrapper for Anthropic Claude API
  - `Meal` entity — userId, description, calories, protein, carbs, fat, loggedAt
  - `MealItem` entity — individual food items within a meal

---

### Feature 3: Meal Logging (Image Upload & Food Scan)
**Goal**: Let users photograph meals or scan barcodes to auto-identify food and macros.

- **Frontend**:
  - `ImageMealUpload` — camera/file picker component
  - `BarcodeScannerView` — uses browser camera API / ZXing for barcode scanning
  - `ScanResultCard` — display recognized food with editable macro values
  - Upload progress indicator + error fallback UI

- **Backend**:
  - `ImageMealController` — `/api/meals/image` (multipart POST)
  - `ImageAnalysisService` — sends image to Claude Vision API for food identification
  - `BarcodeService` — calls Open Food Facts API with barcode UPC
  - `StorageService` — saves uploaded images (local filesystem or S3)
  - Extends `MealParsingService` to unify text + vision output into `Meal` entity

---

### Feature 4: Daily Dashboard & Nutrition Tracking
**Goal**: Provide a clear, at-a-glance view of daily macro intake vs. goals.

- **Frontend**:
  - `DashboardPage` — primary landing screen after login
  - `MacroRingChart` — circular progress rings for calories, protein, carbs, fat (SVG)
  - `ProteinProgressBar` — prominent protein tracker (fitness-focused)
  - `DailyMealSummary` — collapsible list of logged meals for the day
  - `GoalStatusBanner` — contextual feedback (e.g., "You're 30g of protein short")
  - `DateNavigator` — browse past days' logs

- **Backend**:
  - `DashboardController` — `/api/dashboard/daily?date=YYYY-MM-DD`
  - `NutritionSummaryService` — aggregates daily totals from meals, computes % of goal
  - `DashboardDTO` — totals, goal values, per-meal breakdown
  - Reuses `MealRepository` queries (sum by userId + date range)

---

### Feature 5: AI Chat Diet Coach
**Goal**: An interactive chat assistant that gives personalized dietary advice based on the user's goals and recent eating habits.

- **Frontend**:
  - `ChatPage` — full-screen chat interface
  - `ChatBubble` — styled user/assistant message component
  - `ChatInput` — text input with send button
  - `SuggestedPrompts` — pre-built questions (e.g., "What should I eat for dinner?")
  - Streaming response support (Server-Sent Events or WebSocket)

- **Backend**:
  - `ChatController` — `/api/chat/message` (POST), `/api/chat/history` (GET)
  - `ChatService` — builds Claude API prompt with:
    - User profile (goals, weight, targets)
    - Last 7 days' nutrition summary
    - Conversation history
  - `ClaudeStreamClient` — streaming response via SSE to frontend
  - `ChatMessage` entity — userId, role (user/assistant), content, timestamp
  - `ConversationContext` builder — injects user data as system prompt

---

### Feature 6: Notifications & Smart Reminders
**Goal**: Keep users accountable with meal reminders and goal nudges.

- **Frontend**:
  - `NotificationSettings` — configure reminder times
  - `ReminderToast` — in-app push notification component
  - Browser Notification API integration

- **Backend**:
  - `ReminderController` — `/api/reminders` (CRUD)
  - `SchedulerService` — Spring `@Scheduled` jobs for reminder logic
  - `NotificationService` — sends browser push or in-app notifications
  - `UserReminder` entity — userId, reminderTime, type (breakfast/lunch/dinner/goal)

---

## Database ERD (Conceptual)

```
┌─────────────┐       ┌──────────────┐       ┌────────────────┐
│    users    │       │  user_goals  │       │ user_reminders │
│─────────────│       │──────────────│       │────────────────│
│ id (PK)     │──1:1──│ user_id (FK) │       │ id (PK)        │
│ email       │       │ goal_type    │       │ user_id (FK)   │
│ password    │       │ calories     │       │ reminder_time  │
│ name        │       │ protein_g    │       │ type           │
│ age         │       │ carbs_g      │       └────────────────┘
│ weight_kg   │       │ fat_g        │
│ height_cm   │       └──────────────┘
│ created_at  │
└──────┬──────┘
       │ 1:N
       │
┌──────▼──────┐       ┌──────────────┐
│    meals    │       │  meal_items  │
│─────────────│       │──────────────│
│ id (PK)     │──1:N──│ id (PK)      │
│ user_id (FK)│       │ meal_id (FK) │
│ description │       │ food_name    │
│ calories    │       │ quantity     │
│ protein_g   │       │ unit         │
│ carbs_g     │       │ calories     │
│ fat_g       │       │ protein_g    │
│ image_url   │       │ carbs_g      │
│ source      │       │ fat_g        │
│ logged_at   │       └──────────────┘
└─────────────┘

┌──────────────────┐
│  chat_messages   │
│──────────────────│
│ id (PK)          │
│ user_id (FK)     │
│ role (user/ai)   │
│ content          │
│ created_at       │
└──────────────────┘
```

**Source types** for `meals.source`: `TEXT`, `IMAGE`, `BARCODE`

---

## Build Order (Recommended)

| Priority | Feature | Reason |
|---|---|---|
| 1 | Auth & Profile Setup | Foundation — all other features require a logged-in user |
| 2 | Meal Logging (Text) | Core value prop — text input + Claude AI macro parsing |
| 3 | Daily Dashboard | Immediate feedback loop — makes logging feel rewarding |
| 4 | AI Chat Coach | High-value differentiator — personalized coaching |
| 5 | Image & Scan Logging | Enhances UX — reduces friction for power users |
| 6 | Notifications & Reminders | Retention feature — polish after core is solid |

---

## Next Steps

Run each command sequentially to break each feature into actionable development tasks:

```
/plan-feature Feature 1: User Authentication & Profile Setup
/plan-feature Feature 2: Meal Logging (Text Input)
/plan-feature Feature 3: Daily Dashboard & Nutrition Tracking
/plan-feature Feature 4: AI Chat Diet Coach
/plan-feature Feature 5: Meal Logging (Image Upload & Food Scan)
/plan-feature Feature 6: Notifications & Smart Reminders
```

> Start with Feature 1 to establish auth infrastructure, then move to Feature 2 which delivers the core AI-powered value proposition.
