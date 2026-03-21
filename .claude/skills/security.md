# Skill: Security Best Practices

> Authentication, validation, encryption, and OWASP protection.

## Authentication with JWT

### Token Generation (Backend)

```java
// JwtProvider.java
@Component
@Slf4j
public class JwtProvider {

  private static final long JWT_EXPIRATION = 86400000; // 24 hours

  @Value("${app.jwtSecret}")
  private String jwtSecret;

  public String generateToken(String email) {
    return Jwts.builder()
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
        .signWith(SignatureAlgorithm.HS512, jwtSecret)
        .compact();
  }

  public String getUserEmailFromToken(String token) {
    return Jwts.parser()
        .setSigningKey(jwtSecret)
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
  }

  public boolean validateToken(String token) {
    try {
      Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      log.error("Invalid JWT token: {}", e.getMessage());
      return false;
    }
  }
}
```

### Token Usage (Frontend)

```javascript
// services/authService.js
export const authService = {
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const { data } = await response.json();

    // Store token securely (HttpOnly cookie preferred)
    localStorage.setItem('authToken', data.token);
    return data;
  },

  logout() {
    localStorage.removeItem('authToken');
  },

  getToken() {
    return localStorage.getItem('authToken');
  },

  async refreshToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    const { data } = await response.json();
    localStorage.setItem('authToken', data.token);
    return data.token;
  }
};
```

## Input Validation

### Backend Validation

```java
// CreateUserRequest.java
@Getter @Setter
public class CreateUserRequest {

  @NotBlank(message = "Email is required")
  @Email(message = "Email must be valid")
  @Size(max = 255)
  private String email;

  @NotBlank(message = "Name is required")
  @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
  private String name;

  @NotBlank(message = "Password is required")
  @Size(min = 8, message = "Password must be at least 8 characters")
  @Pattern(
      regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[a-zA-Z\\d@$!%*?&]{8,}$",
      message = "Password must contain uppercase, lowercase, digit, and special character"
  )
  private String password;

  private String phone;
}

// UserController.java
@PostMapping
public ResponseEntity<ApiResponse<UserDTO>> createUser(
    @Valid @RequestBody CreateUserRequest request) {
  // Validation happens automatically via @Valid
  return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.ok(userService.createUser(request)));
}
```

### Frontend Validation

```javascript
// components/LoginForm.jsx
export const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return Object.keys(newErrors).length === 0 ? null : newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (formErrors) {
      setErrors(formErrors);
      return;
    }

    try {
      await onSubmit({ email, password });
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Render errors */}
      {Object.entries(errors).map(([field, error]) => (
        <p key={field} style={{ color: 'red' }}>{error}</p>
      ))}
    </form>
  );
};
```

## SQL Injection Prevention

### ❌ Vulnerable (String Concatenation)

```java
String query = "SELECT * FROM users WHERE email = '" + email + "'";
List<User> users = em.createNativeQuery(query, User.class).getResultList();
```

### ✅ Safe (Parameterized Query)

```java
// Method 1: JPA Repository (Preferred)
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  // JPA handles parameterization automatically
}

// Method 2: @Query with Parameters
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmail(@Param("email") String email);

// Method 3: Native Query (if necessary)
@Query(value = "SELECT * FROM users WHERE email = ?1", nativeQuery = true)
Optional<User> findByEmail(String email);
```

## XSS Prevention

### ❌ Vulnerable (innerHTML)

```javascript
// Don't do this!
const userInput = req.query.search;
document.getElementById('results').innerHTML = `
  <p>Search results for: ${userInput}</p>
`;
// If userInput = "<img src=x onerror='alert(\"XSS\")'>"
// The script will execute!
```

### ✅ Safe (textContent or React)

```javascript
// Method 1: textContent (plain text)
const userInput = req.query.search;
const results = document.getElementById('results');
results.textContent = `Search results for: ${userInput}`;

// Method 2: React (auto-escapes)
export const SearchResults = ({ search }) => (
  <div>
    <p>Search results for: {search}</p>
  </div>
);
// React automatically escapes the value
```

## Password Security

### Hashing (Backend)

```java
// UserService.java
@Service
@RequiredArgsConstructor
public class UserService {

  private final PasswordEncoder passwordEncoder;

  public UserDTO createUser(CreateUserRequest request) {
    // Hash password (never store plaintext!)
    String hashedPassword = passwordEncoder.encode(request.getPassword());

    User user = new User();
    user.setEmail(request.getEmail());
    user.setPassword(hashedPassword);  // Store hash, not plaintext

    return UserDTO.fromEntity(userRepository.save(user));
  }

  public boolean authenticateUser(String password, String hashedPassword) {
    return passwordEncoder.matches(password, hashedPassword);
  }
}

// SecurityConfig.java
@Configuration
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();  // BCrypt recommended
  }
}
```

## CORS Configuration

### ❌ Insecure (Allow All)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOrigins("*")  // DANGEROUS!
        .allowedMethods("*");
  }
}
```

### ✅ Secure (Whitelist)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOrigins(
            "http://localhost:5173",
            "https://myapp.com",
            "https://www.myapp.com"
        )
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .allowedHeaders("*")
        .allowCredentials(true)
        .maxAge(3600);
  }
}
```

## CSRF Protection

### Spring Security (Automatic)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf()
        .and()
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated()
        );
    return http.build();
  }
}
```

### Frontend (Include CSRF Token)

```javascript
// Fetch CSRF token from cookie
const getCsrfToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.content;
};

// Use in requests
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken()
  },
  body: JSON.stringify({ name: 'John' })
});
```

## Environment Variables & Secrets

### ❌ Bad (Hardcoded)

```java
public class AuthService {
  private static final String JWT_SECRET = "super-secret-key-12345";
  private static final String DB_PASSWORD = "mydbpassword";
}
```

### ✅ Good (Environment Variables)

```java
@Service
public class AuthService {
  @Value("${app.jwt.secret}")
  private String jwtSecret;

  @Value("${spring.datasource.password}")
  private String dbPassword;
}
```

### application-prod.yml

```yaml
app:
  jwt:
    secret: ${JWT_SECRET}    # From environment variable

spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USER}
    password: ${DATABASE_PASSWORD}
```

## Security Checklist

- ✅ Use HTTPS in production (TLS)
- ✅ Hash passwords (BCrypt, Argon2)
- ✅ Validate all inputs
- ✅ Use parameterized queries
- ✅ Escape HTML output (prevent XSS)
- ✅ Enable CSRF protection
- ✅ Use secure cookies (HttpOnly, Secure, SameSite)
- ✅ Set security headers
  ```
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'
  ```
- ✅ Log security events (auth failures, data access)
- ✅ Scan dependencies (npm audit, Maven)
- ✅ Use rate limiting on APIs
- ✅ Never commit secrets (use .env files)
