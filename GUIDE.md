# Developer Guide — Building Full-Stack Features

> End-to-end walkthrough for creating applications and features using the React + Spring Boot stack with AI-assisted development tools.

---

## Table of Contents

1. [Prerequisites & Initial Setup](#1-prerequisites--initial-setup)
2. [Project Structure Overview](#2-project-structure-overview)
3. [Understanding the AI Workflow System](#3-understanding-the-ai-workflow-system)
4. [Building Your First Feature — End-to-End Example](#4-building-your-first-feature--end-to-end-example)
5. [Frontend Development Deep Dive](#5-frontend-development-deep-dive)
6. [Backend Development Deep Dive](#6-backend-development-deep-dive)
7. [Database Design](#7-database-design)
8. [API Contract — Request & Response Standards](#8-api-contract--request--response-standards)
9. [Authentication & Security](#9-authentication--security)
10. [Testing Strategy](#10-testing-strategy)
11. [Code Review & Quality Gates](#11-code-review--quality-gates)
12. [Deployment](#12-deployment)
13. [Full Feature Checklist](#13-full-feature-checklist)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prerequisites & Initial Setup

### Required Tools

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 18.x LTS | `node --version` |
| npm | 9.x | `npm --version` |
| Java | 17 LTS | `java --version` |
| Maven | 3.9.x | `mvn --version` |
| PostgreSQL | 14+ | `psql --version` |
| Claude Code CLI | Latest | `claude --version` |

### 1.1 Clone and Bootstrap

```bash
git clone <your-repo>
cd your-project

# Install frontend dependencies
cd frontend && npm install

# Backend dependencies are fetched by Maven automatically
cd ../backend && ./mvnw dependency:resolve
```

### 1.2 Configure Environment

**frontend/.env** (create this file — never commit it):
```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

**backend/src/main/resources/application-dev.yml** (create this file — never commit it):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/myapp
    username: postgres
    password: yourpassword
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
server:
  port: 8080
jwt:
  secret: your-256-bit-secret-key
  expiration: 86400000
```

### 1.3 Start Development Servers

```bash
# Terminal 1 — Frontend (http://localhost:5173)
cd frontend && npm run dev

# Terminal 2 — Backend (http://localhost:8080)
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Verify both servers are running before writing any feature code.

---

## 2. Project Structure Overview

```
project/
├── CLAUDE.md                    # AI agent instructions (read by Claude)
├── GUIDE.md                     # This file
├── readme.md                    # Public documentation
│
├── .claude/                     # AI Development System
│   ├── commands/                # Slash commands you type
│   ├── agents/                  # Specialized AI workers
│   ├── skills/                  # Knowledge bases agents use
│   └── settings.json            # Permissions & configuration
│
├── frontend/                    # React 18 + Vite
│   └── src/
│       ├── components/          # Reusable UI components
│       ├── pages/               # Page-level components (route targets)
│       ├── hooks/               # Custom React hooks
│       ├── services/            # API clients (Axios/fetch wrappers)
│       ├── store/               # State (Redux slices / Zustand stores)
│       └── styles/              # Global CSS / Tailwind config
│
└── backend/                     # Spring Boot 3.2 + Java 17
    └── src/main/java/com/example/
        ├── config/              # Security, CORS, database config
        ├── common/              # Shared: ApiResponse, exceptions, utils
        └── <domain>/            # One folder per domain (user, order, etc.)
            ├── controller/
            ├── service/
            ├── repository/
            ├── entity/
            └── dto/
```

### Domain-Driven Folder Rule

Each feature lives in its own domain folder on the backend. Never mix domain logic across folders. For example:

```
backend/.../
├── user/        # Everything about users
├── order/       # Everything about orders
├── payment/     # Everything about payments
└── common/      # Shared utilities only
```

---

## 3. Understanding the AI Workflow System

The project includes a Claude Code command system that automates development tasks. Think of it as a team of specialized engineers you can invoke.

### Architecture

```
You type a command
       ↓
Command file orchestrates the workflow
       ↓
Delegates to the right Agent
       ↓
Agent loads relevant Skills (knowledge bases)
       ↓
Agent generates code / analysis
```

### Available Commands

| Command | When to Use |
|---------|------------|
| `/plan-feature <description>` | Before starting any new feature |
| `/build-frontend <task>` | Build React components, hooks, state |
| `/build-backend <task>` | Build controllers, services, repositories |
| `/build-db <description>` | Design database schemas and indexes |
| `/review-code [path]` | Audit code quality and security |
| `/run-tests [scope]` | Generate and run tests with coverage |
| `/fix-bug <error>` | Debug and fix issues |
| `/deploy [environment]` | Deploy to staging or production |

### When to Use What

```
New feature idea
    → /plan-feature

Implementing UI
    → /build-frontend

Implementing API
    → /build-backend

Database changes
    → /build-db

Before merging
    → /review-code, then /run-tests

Something is broken
    → /fix-bug

Ready to ship
    → /deploy staging, then /deploy production
```

---

## 4. Building Your First Feature — End-to-End Example

We'll build a **User Management** feature (create, list, update, delete users) from scratch.

### Step 1: Plan the Feature

```bash
/plan-feature Build user management with CRUD operations, pagination, and role-based access
```

The Architect Agent will output a structured plan like:

```
## Feature Plan: User Management

### Frontend Tasks
- [ ] UserList page with pagination and search
- [ ] UserForm component for create/edit
- [ ] UserCard component for display
- [ ] userSlice (Redux) or useUserStore (Zustand)
- [ ] userService.js for API calls

### Backend APIs
- [ ] GET  /api/users          — list with pagination
- [ ] GET  /api/users/{id}     — get by ID
- [ ] POST /api/users          — create user
- [ ] PUT  /api/users/{id}     — update user
- [ ] DELETE /api/users/{id}   — soft delete

### Database Schema
- users table: id, name, email (unique), role, active, created_at, updated_at

### Edge Cases
- Duplicate email on create/update
- Delete an admin user
- Invalid pagination params
- Concurrent updates (optimistic locking)

### Validation Rules
- Email: valid format + unique
- Name: 2–100 characters
- Role: enum [USER, ADMIN, MODERATOR]
```

Review the plan. If anything is off, refine your request and re-run.

---

### Step 2: Build the Backend First

Building backend first lets you define the API contract before the frontend consumes it.

```bash
/build-backend Create User entity, UserDTO, UserRepository, UserService, and UserController with CRUD and pagination
```

The Backend Agent will generate files like:

**`backend/.../user/entity/User.java`**
```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(nullable = false)
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Role { USER, ADMIN, MODERATOR }
}
```

**`backend/.../user/dto/UserDTO.java`**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private User.Role role;
    private boolean active;
    private LocalDateTime createdAt;

    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .active(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
```

**`backend/.../user/dto/CreateUserRequest.java`**
```java
@Data
public class CreateUserRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be 2–100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Role is required")
    private User.Role role;
}
```

**`backend/.../user/repository/UserRepository.java`**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    Optional<User> findByEmailAndActiveTrue(String email);

    Page<User> findByActiveTrue(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.active = true AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);
}
```

**`backend/.../user/service/UserService.java`**
```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<UserDTO> getUsers(String search, Pageable pageable) {
        Page<User> users = (search != null && !search.isBlank())
            ? userRepository.searchUsers(search, pageable)
            : userRepository.findByActiveTrue(pageable);
        return users.map(UserDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
            .map(UserDTO::fromEntity)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .role(request.getRole())
            .build();
        User saved = userRepository.save(user);
        log.info("Created user id={} email={}", saved.getId(), saved.getEmail());
        return UserDTO.fromEntity(saved);
    }

    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new ConflictException("Email already in use: " + request.getEmail());
        }
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        log.info("Updated user id={}", id);
        return UserDTO.fromEntity(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(false);   // soft delete
        userRepository.save(user);
        log.info("Soft-deleted user id={}", id);
    }
}
```

**`backend/.../user/controller/UserController.java`**
```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(parseSort(sort)));
        return ResponseEntity.ok(ApiResponse.ok(userService.getUsers(search, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserDTO created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.updateUser(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "User deleted successfully"));
    }

    private Sort.Order[] parseSort(String[] sort) {
        // parse "field,direction" strings into Sort.Order objects
        return Arrays.stream(sort)
            .map(s -> s.split(","))
            .map(parts -> parts.length > 1 && parts[1].equalsIgnoreCase("desc")
                ? Sort.Order.desc(parts[0])
                : Sort.Order.asc(parts[0]))
            .toArray(Sort.Order[]::new);
    }
}
```

---

### Step 3: Build the Frontend

```bash
/build-frontend Create UserList page with pagination and search, UserForm for create/edit, and userService API client
```

**`frontend/src/services/userService.js`**
```javascript
import axios from 'axios';

const BASE = `${import.meta.env.VITE_API_URL}/users`;

export const userService = {
  getUsers: (params = {}) =>
    axios.get(BASE, { params }).then(r => r.data.data),

  getUserById: (id) =>
    axios.get(`${BASE}/${id}`).then(r => r.data.data),

  createUser: (data) =>
    axios.post(BASE, data).then(r => r.data.data),

  updateUser: (id, data) =>
    axios.put(`${BASE}/${id}`, data).then(r => r.data.data),

  deleteUser: (id) =>
    axios.delete(`${BASE}/${id}`).then(r => r.data),
};
```

**`frontend/src/hooks/useUsers.js`**
```javascript
import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

export function useUsers(initialParams = {}) {
  const [users, setUsers] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 0, size: 20, ...initialParams });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers(params);
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, loading, error, params, setParams, refetch: fetchUsers };
}
```

**`frontend/src/pages/UserList.jsx`**
```jsx
import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import UserCard from '../components/UserCard';
import UserForm from '../components/UserForm';
import { userService } from '../services/userService';

export default function UserList() {
  const { users, loading, error, params, setParams, refetch } = useUsers();
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setParams(p => ({ ...p, search, page: 0 }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await userService.deleteUser(id);
    refetch();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
    refetch();
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add User
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="border rounded px-3 py-2 flex-1"
        />
        <button type="submit" className="bg-gray-100 px-4 py-2 rounded border">
          Search
        </button>
      </form>

      <div className="grid gap-4">
        {users.content.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={() => { setEditingUser(user); setShowForm(true); }}
            onDelete={() => handleDelete(user.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">
          {users.totalElements} total users
        </span>
        <div className="flex gap-2">
          <button
            disabled={params.page === 0}
            onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {params.page + 1} of {users.totalPages}
          </span>
          <button
            disabled={params.page + 1 >= users.totalPages}
            onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditingUser(null); }}
        />
      )}
    </div>
  );
}
```

---

### Step 4: Review the Code

```bash
# Review backend domain
/review-code backend/src/main/java/com/example/user/

# Review frontend components
/review-code frontend/src/pages/
/review-code frontend/src/hooks/
```

The Reviewer Agent (uses the more powerful Opus model) checks for:
- Security vulnerabilities (SQL injection, XSS, CSRF)
- Performance issues (N+1 queries, missing indexes)
- Code quality (SOLID violations, duplication)
- Missing validation or error handling

Fix all CRITICAL and HIGH severity issues before continuing.

---

### Step 5: Run Tests

```bash
/run-tests all --coverage
```

Minimum targets: **70% coverage** for both frontend and backend.

If coverage is below target:
```bash
/run-tests backend --add-missing
/run-tests frontend --add-missing
```

---

### Step 6: Deploy

```bash
# Test in staging first
/deploy staging

# After verifying staging works
/deploy production
```

---

## 5. Frontend Development Deep Dive

### Component Architecture

```
pages/          # Route-level components — orchestrate features
components/     # Reusable, stateless (or lightly stateful) UI
hooks/          # Business logic, data fetching, state management
services/       # Pure API functions (no React)
store/          # Global state slices (Redux or Zustand)
```

**Rule**: Components never call APIs directly. All API calls go through `services/`, consumed via `hooks/`.

### Component Template

```jsx
// components/UserCard.jsx
import PropTypes from 'prop-types';

export default function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{user.name}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
        <span className={`text-xs px-2 py-1 rounded ${
          user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
        }`}>
          {user.role}
        </span>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-blue-600 hover:underline text-sm">
          Edit
        </button>
        <button onClick={onDelete} className="text-red-600 hover:underline text-sm">
          Delete
        </button>
      </div>
    </div>
  );
}

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
```

### State Management Decision Tree

```
Does the state need to be shared across many components?
    ├── Yes, across the whole app → Redux Toolkit
    ├── Yes, across a subtree only → Zustand store or Context
    └── No, local to one component → useState / useReducer
```

**Zustand store example:**
```javascript
// store/userStore.js
import { create } from 'zustand';
import { userService } from '../services/userService';

export const useUserStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await userService.getUsers(params);
      set({ users: data.content, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addUser: (user) => set(state => ({ users: [user, ...state.users] })),

  removeUser: (id) => set(state => ({
    users: state.users.filter(u => u.id !== id)
  })),
}));
```

### Form Handling Pattern

```jsx
// hooks/useForm.js — generic form hook
import { useState } from 'react';

export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(v => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }));
  };

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();
    const validationErrors = validate ? validate(values) : {};
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, submitting, handleChange, handleSubmit };
}
```

### API Error Handling

Set up a global Axios interceptor in your app entry point:

```javascript
// services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Attach JWT token to every request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 6. Backend Development Deep Dive

### Package Structure (One Domain = One Package)

```
com.example.
├── Application.java
├── common/
│   ├── dto/ApiResponse.java          # Standard response wrapper
│   ├── exception/
│   │   ├── ResourceNotFoundException.java
│   │   ├── ConflictException.java
│   │   └── GlobalExceptionHandler.java
│   └── config/
│       ├── SecurityConfig.java
│       └── JwtConfig.java
└── user/
    ├── controller/UserController.java
    ├── service/UserService.java
    ├── repository/UserRepository.java
    ├── entity/User.java
    └── dto/
        ├── UserDTO.java
        ├── CreateUserRequest.java
        └── UpdateUserRequest.java
```

### Standard API Response Wrapper

```java
// common/dto/ApiResponse.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;
    private int code;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .message("Success")
            .code(200)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .message(message)
            .code(200)
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
```

### Global Exception Handler

```java
// common/exception/GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage(), 404));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(ConflictException ex) {
        return ResponseEntity.status(409).body(ApiResponse.error(ex.getMessage(), 409));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                FieldError::getDefaultMessage,
                (a, b) -> a
            ));
        return ResponseEntity.status(400)
            .body(ApiResponse.<Map<String, String>>builder()
                .success(false)
                .data(errors)
                .message("Validation failed")
                .code(400)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Unexpected error: ", ex);
        return ResponseEntity.status(500).body(ApiResponse.error("Internal server error", 500));
    }
}
```

### Custom Exceptions

```java
// Keep these simple
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}

public class ConflictException extends RuntimeException {
    public ConflictException(String message) { super(message); }
}
```

### Service Layer Rules

- Every public method on a `@Service` class should have `@Transactional`
- Read-only methods get `@Transactional(readOnly = true)` for performance
- Never call repositories from controllers — always go through services
- Throw custom exceptions rather than returning null or optional to controllers

---

## 7. Database Design

### Naming Conventions

| Object | Convention | Example |
|--------|-----------|---------|
| Tables | `snake_case`, plural | `user_orders` |
| Columns | `snake_case` | `created_at` |
| Indexes | `idx_table_column` | `idx_users_email` |
| Foreign keys | `fk_table_column` | `fk_orders_user_id` |

### Entity Best Practices

```java
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_orders_user_id", columnList = "user_id"),
    @Index(name = "idx_orders_status", columnList = "status"),
    @Index(name = "idx_orders_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Always reference by ID, not the full object, unless you need eager data
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    // Always use BigDecimal for money — never double or float
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Version field for optimistic locking
    @Version
    private Long version;
}
```

### Using `/build-db`

```bash
/build-db Create orders collection with user reference, status enum, and monetary amounts
```

The Database Agent will output:
- Entity class with proper annotations
- Migration SQL (if using Flyway/Liquibase)
- Index recommendations
- Repository with common queries

---

## 8. API Contract — Request & Response Standards

### URL Conventions

```
GET    /api/{resource}           — list (paginated)
GET    /api/{resource}/{id}      — get by ID
POST   /api/{resource}           — create
PUT    /api/{resource}/{id}      — full update
PATCH  /api/{resource}/{id}      — partial update
DELETE /api/{resource}/{id}      — delete
```

### Pagination Parameters

```
GET /api/users?page=0&size=20&sort=createdAt,desc&search=john
```

### Response Format

**Success list:**
```json
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 100,
    "totalPages": 5,
    "number": 0,
    "size": 20
  },
  "message": "Success",
  "code": 200,
  "timestamp": "2026-03-21T10:00:00Z"
}
```

**Success single:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "Alice" },
  "message": "Success",
  "code": 200,
  "timestamp": "2026-03-21T10:00:00Z"
}
```

**Validation error:**
```json
{
  "success": false,
  "data": {
    "email": "Invalid email format",
    "name": "Name must be 2–100 characters"
  },
  "message": "Validation failed",
  "code": 400,
  "timestamp": "2026-03-21T10:00:00Z"
}
```

---

## 9. Authentication & Security

### JWT Flow

```
1. POST /api/auth/login { email, password }
       ↓
2. Server validates credentials
       ↓
3. Server returns { accessToken, refreshToken }
       ↓
4. Client stores tokens (memory for access, httpOnly cookie for refresh)
       ↓
5. Client sends Authorization: Bearer <accessToken> on every request
       ↓
6. When access token expires: POST /api/auth/refresh with refreshToken
```

### Spring Security Config Skeleton

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)         // disabled for stateless JWT APIs
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### Security Checklist Before Shipping

- [ ] All secrets in environment variables, not code
- [ ] Passwords hashed with BCrypt (never plain or MD5/SHA1)
- [ ] JWT signed with a strong secret (256-bit minimum)
- [ ] CORS configured explicitly (not `*`)
- [ ] Input validation on all request bodies
- [ ] SQL injection not possible (JPA/parameterized queries only)
- [ ] Sensitive error details not exposed to clients
- [ ] HTTPS enforced in production

```bash
# Run the security agent
/review-code --security-focus
```

---

## 10. Testing Strategy

### Backend — Unit Tests (JUnit 5 + Mockito)

Test services in isolation by mocking repositories.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_Success() {
        CreateUserRequest request = new CreateUserRequest();
        request.setName("Alice");
        request.setEmail("alice@example.com");
        request.setRole(User.Role.USER);

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        UserDTO result = userService.createUser(request);

        assertNotNull(result);
        assertEquals("Alice", result.getName());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_DuplicateEmail_ThrowsConflict() {
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("existing@example.com");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> userService.createUser(request));
        verify(userRepository, never()).save(any());
    }
}
```

### Backend — Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createUser_ReturnsCreated() throws Exception {
        var request = Map.of(
            "name", "Bob",
            "email", "bob@example.com",
            "role", "USER"
        );

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Bob"))
            .andExpect(jsonPath("$.data.email").value("bob@example.com"));
    }
}
```

### Frontend — Component Tests (Vitest + React Testing Library)

```javascript
// components/UserCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from './UserCard';

const mockUser = { id: 1, name: 'Alice', email: 'alice@test.com', role: 'USER' };

describe('UserCard', () => {
  it('renders user information', () => {
    render(<UserCard user={mockUser} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<UserCard user={mockUser} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
# All tests with coverage
/run-tests all --coverage

# Frontend only
cd frontend && npm run test -- --coverage

# Backend only
cd backend && ./mvnw test

# Watch mode (frontend)
cd frontend && npm run test -- --watch
```

---

## 11. Code Review & Quality Gates

### Run Before Every Merge

```bash
# 1. Review code quality and security
/review-code frontend/src/
/review-code backend/src/

# 2. Ensure tests pass and coverage meets target
/run-tests all --coverage

# 3. Fix any issues found, then repeat
```

### What the Reviewer Checks

| Severity | Examples | Action |
|----------|---------|--------|
| CRITICAL | SQL injection, hardcoded secrets, auth bypass | Block merge immediately |
| HIGH | Missing auth on endpoints, XSS vulnerability | Fix before merge |
| MEDIUM | Missing error handling, poor performance | Fix if time allows |
| LOW | Code style, minor duplication | Backlog |

### Pre-merge Checklist

- [ ] `/review-code` passes with no CRITICAL or HIGH issues
- [ ] `/run-tests all --coverage` shows 70%+ coverage
- [ ] No hardcoded secrets, URLs, or credentials
- [ ] All API endpoints have authentication (unless explicitly public)
- [ ] Input validation on all user-facing endpoints
- [ ] Error messages don't leak internal details
- [ ] Environment variables documented in `.env.example`

---

## 12. Deployment

### Build Artifacts

```bash
# Frontend — produces dist/ folder
cd frontend && npm run build

# Backend — produces target/*.jar
cd backend && ./mvnw clean package -DskipTests
```

### Dockerfile (Multi-stage)

```dockerfile
# Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -q
COPY backend/src ./src
RUN mvn package -DskipTests -q

# Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
COPY --from=frontend-build /app/dist ./static
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Using the Deploy Command

```bash
# Deploy to staging first
/deploy staging

# Verify staging works, then deploy to production
/deploy production
```

The DevOps Agent will:
- Build Docker images
- Set up GitHub Actions CI/CD pipeline
- Configure environment variables per environment
- Run health checks

### Environment Variable Management

Never commit `.env` files. Document required variables in `.env.example`:

```env
# Frontend
VITE_API_URL=
VITE_ENV=

# Backend
DATABASE_URL=
DATABASE_USER=
DATABASE_PASSWORD=
JWT_SECRET=
JWT_EXPIRATION=
```

---

## 13. Full Feature Checklist

Use this checklist for every new feature from planning to production.

### Planning
- [ ] `/plan-feature` run and plan reviewed
- [ ] API contract agreed upon (endpoints, request/response shapes)
- [ ] Database schema changes identified
- [ ] Edge cases documented

### Implementation
- [ ] Backend entity, DTO, repository, service, controller created
- [ ] Input validation on all request bodies
- [ ] Custom exceptions thrown for known error cases
- [ ] Global exception handler covers all custom exceptions
- [ ] Frontend service functions created
- [ ] Custom hooks for data fetching created
- [ ] Page and component files created
- [ ] Loading, error, and empty states handled in UI

### Quality
- [ ] `/review-code` run on frontend and backend — no CRITICAL/HIGH issues
- [ ] `/run-tests all --coverage` — 70%+ coverage achieved
- [ ] Unit tests for service logic
- [ ] Integration tests for API endpoints
- [ ] Component tests for UI components

### Security
- [ ] All new endpoints require authentication (unless explicitly public)
- [ ] No secrets in code
- [ ] Input sanitized and validated
- [ ] Error messages don't leak implementation details

### Deployment
- [ ] `.env.example` updated with any new variables
- [ ] `/deploy staging` — staging deployment verified
- [ ] Smoke test on staging (manual or automated)
- [ ] `/deploy production` — production deployed
- [ ] Post-deploy health check

---

## 14. Troubleshooting

### Frontend

**`Cannot read properties of undefined (reading 'map')`**
```bash
/fix-bug "Cannot read properties of undefined (reading 'map') in UserList.jsx"
```
Root cause is usually async data not yet loaded. Always initialize state as an empty array, not `null` or `undefined`.

**CORS errors in browser**
Check your Spring Security CORS config. The backend must explicitly allow `http://localhost:5173` in development.

**Vite proxy not working**
Add to `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

### Backend

**`Port 8080 is already in use`**
```bash
lsof -ti:8080 | xargs kill
```

**`Could not autowire — No qualifying bean`**
Check that your class has `@Service`, `@Repository`, or `@Component`. Verify the package is under the base package scanned by `@SpringBootApplication`.

**`LazyInitializationException`**
You're accessing a `LAZY` relationship outside a transaction. Either mark the service method `@Transactional`, use a JOIN FETCH query, or use a DTO projection.

**Database migration fails (Flyway/Liquibase)**
Never modify an existing migration file. Add a new migration file with the next version number.

### Tests

**Tests passing locally but failing in CI**
Usually a timing or database state issue. Ensure `@Transactional` rolls back after each test and no test depends on another.

**Coverage below 70%**
```bash
/run-tests backend --add-missing
```
The QA Agent will identify untested methods and generate test stubs.

---

## Quick Reference

```bash
# Start development
cd frontend && npm run dev
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# New feature workflow
/plan-feature <description>
/build-backend <task>
/build-frontend <task>
/review-code backend/src/ frontend/src/
/run-tests all --coverage
/deploy staging
/deploy production

# Debug
/fix-bug "<error message>"

# Maintenance
/review-code           # Full audit
/run-tests all         # Verify nothing broken
```

---

*Last updated: 2026-03-21 | React 18.2.0 | Spring Boot 3.2.0 | Java 17*
