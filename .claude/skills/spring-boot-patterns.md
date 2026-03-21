# Skill: Spring Boot Patterns

> Clean architecture patterns for Spring Boot 3.2.0 with Java 17+.

## Package Structure

```
src/main/java/com/example/
├── DemoApplication.java          # Entry point
├── config/                        # Spring configuration
│   ├── SecurityConfig.java
│   └── WebConfig.java
├── common/                        # Shared across domains
│   ├── exception/
│   │   ├── ResourceNotFoundException.java
│   │   ├── DuplicateResourceException.java
│   │   ├── GlobalExceptionHandler.java
│   │   └── ErrorResponse.java
│   └── dto/
│       └── ApiResponse.java
├── user/                          # Domain module
│   ├── controller/
│   │   └── UserController.java
│   ├── service/
│   │   └── UserService.java
│   ├── repository/
│   │   └── UserRepository.java
│   ├── entity/
│   │   └── User.java
│   └── dto/
│       ├── UserDTO.java
│       ├── CreateUserRequest.java
│       └── UpdateUserRequest.java
└── order/                         # Another domain
    ├── controller/
    ├── service/
    ├── repository/
    ├── entity/
    └── dto/
```

## Controller Pattern

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173"})
public class UserController {

  private final UserService userService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<UserDTO>>> listUsers(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(
        ApiResponse.ok(userService.listUsers(page, size))
    );
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<UserDTO>> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(
        ApiResponse.ok(userService.getUserById(id))
    );
  }

  @PostMapping
  public ResponseEntity<ApiResponse<UserDTO>> createUser(
      @Valid @RequestBody CreateUserRequest request) {
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ApiResponse.ok(userService.createUser(request)));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<UserDTO>> updateUser(
      @PathVariable Long id,
      @Valid @RequestBody UpdateUserRequest request) {
    return ResponseEntity.ok(
        ApiResponse.ok(userService.updateUser(id, request))
    );
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}
```

## Service Pattern

```java
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional(readOnly = true)
  public List<UserDTO> listUsers(int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<User> users = userRepository.findAll(pageable);
    return users.map(UserDTO::fromEntity).getContent();
  }

  @Transactional(readOnly = true)
  public UserDTO getUserById(Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "User with id %d not found".formatted(id)
        ));
    return UserDTO.fromEntity(user);
  }

  public UserDTO createUser(CreateUserRequest request) {
    // Validation
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new DuplicateResourceException("Email already registered");
    }

    // Business logic
    User user = new User();
    user.setEmail(request.getEmail());
    user.setName(request.getName());
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    User saved = userRepository.save(user);
    log.info("User created: {}", saved.getId());

    return UserDTO.fromEntity(saved);
  }

  public void deleteUser(Long id) {
    if (!userRepository.existsById(id)) {
      throw new ResourceNotFoundException("User not found");
    }
    userRepository.deleteById(id);
    log.info("User {} deleted", id);
  }
}
```

## Repository Pattern

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);

  List<User> findByStatusOrderByCreatedAtDesc(String status);

  @Query("SELECT u FROM User u WHERE u.createdAt >= :startDate AND u.createdAt <= :endDate")
  List<User> findByDateRange(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate
  );

  Page<User> findByStatus(String status, Pageable pageable);
}
```

## Entity Pattern

```java
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  @Email(message = "Email should be valid")
  private String email;

  @Column(nullable = false)
  @NotBlank(message = "Name is required")
  @Size(min = 2, max = 100)
  private String name;

  @Column(nullable = false)
  private String password;

  @Column(length = 20)
  private String phone;

  @Column(length = 50)
  @Builder.Default
  private String status = "ACTIVE";

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    if (status == null) status = "ACTIVE";
  }
}
```

## DTO Pattern

```java
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDTO {
  private Long id;
  private String email;
  private String name;
  private String phone;
  private String status;
  private LocalDateTime createdAt;

  public static UserDTO fromEntity(User user) {
    return UserDTO.builder()
        .id(user.getId())
        .email(user.getEmail())
        .name(user.getName())
        .phone(user.getPhone())
        .status(user.getStatus())
        .createdAt(user.getCreatedAt())
        .build();
  }
}

@Getter @Setter
public class CreateUserRequest {
  @Email(message = "Email must be valid")
  @NotBlank
  private String email;

  @NotBlank(message = "Name is required")
  @Size(min = 2, max = 100)
  private String name;

  @NotBlank(message = "Password is required")
  @Size(min = 8, message = "Password must be at least 8 characters")
  private String password;
}
```

## Exception Handling

```java
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(
      ResourceNotFoundException ex, WebRequest request) {
    ErrorResponse error = ErrorResponse.builder()
        .message(ex.getMessage())
        .status(HttpStatus.NOT_FOUND.value())
        .timestamp(LocalDateTime.now())
        .build();
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationError(
      MethodArgumentNotValidException ex) {
    String message = ex.getBindingResult()
        .getFieldError()
        .getDefaultMessage();
    ErrorResponse error = ErrorResponse.builder()
        .message("Validation failed: " + message)
        .status(HttpStatus.BAD_REQUEST.value())
        .timestamp(LocalDateTime.now())
        .build();
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
    log.error("Unexpected error", ex);
    ErrorResponse error = ErrorResponse.builder()
        .message("Internal Server Error")
        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .timestamp(LocalDateTime.now())
        .build();
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
  }
}
```

## API Response Wrapper

```java
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
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
```
