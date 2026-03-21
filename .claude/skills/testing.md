# Skill: Testing Strategy

> Unit, integration, and E2E testing with mocking strategies.

## Test Pyramid

```
        E2E (10%) - Full system flow
       / \
      /   \
   Integration (30%) - Component interaction
     / \   / \
    /   \ /   \
Unit Tests (60%) - Individual functions
```

## Frontend Testing

### Unit Tests (Vitest)

```javascript
// src/utils/validators.test.js
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from './validators';

describe('Email Validator', () => {
  it('should validate correct email format', () => {
    expect(validateEmail('john@example.com')).toBe(true);
  });

  it('should reject invalid email format', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  it('should reject empty email', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('Password Validator', () => {
  it('should accept password with 8+ chars, uppercase, lowercase, number', () => {
    expect(validatePassword('Secure1Pass')).toBe(true);
  });

  it('should reject password with less than 8 characters', () => {
    expect(validatePassword('Short1')).toBe(false);
  });

  it('should reject password without uppercase letter', () => {
    expect(validatePassword('lowercase1pass')).toBe(false);
  });
});
```

### Component Tests (React Testing Library)

```javascript
// src/components/__tests__/LoginForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from '../LoginForm';

describe('LoginForm Component', () => {
  // Happy path
  it('should submit form with valid credentials', async () => {
    const mockOnSubmit = vi.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitBtn = screen.getByText('Login');

    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'john@test.com',
        password: 'Password123'
      });
    });
  });

  // Error scenario
  it('should display error message on failed login', async () => {
    const mockOnSubmit = vi.fn()
        .mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'john@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'WrongPassword' }
    });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  // Edge case
  it('should show validation errors for empty fields', async () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  // Accessibility
  it('should have proper ARIA labels', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});
```

### Hook Tests

```javascript
// src/hooks/__tests__/useApi.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '../useApi';

describe('useApi Hook', () => {
  it('should fetch data successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ users: [{ id: 1, name: 'John' }] })
      })
    );

    const { result } = renderHook(() => useApi('/api/users'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ users: [{ id: 1, name: 'John' }] });
      expect(result.current.error).toBe(null);
    });
  });

  it('should handle fetch errors', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useApi('/api/users'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error?.message).toBe('Network error');
      expect(result.current.data).toBe(null);
    });
  });
});
```

## Backend Testing

### Unit Tests (JUnit 5)

```java
// src/test/java/com/example/user/UserServiceTest.java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @InjectMocks
  private UserService userService;

  // Happy path
  @Test
  void createUser_WithValidData_ReturnsUserDTO() {
    // Arrange
    CreateUserRequest request = new CreateUserRequest();
    request.setEmail("john@test.com");
    request.setName("John Doe");
    request.setPassword("Password123");

    User savedUser = new User();
    savedUser.setId(1L);
    savedUser.setEmail("john@test.com");
    savedUser.setName("John Doe");

    when(userRepository.existsByEmail("john@test.com")).thenReturn(false);
    when(passwordEncoder.encode("Password123")).thenReturn("hashed_password");
    when(userRepository.save(any(User.class))).thenReturn(savedUser);

    // Act
    UserDTO result = userService.createUser(request);

    // Assert
    assertEquals("john@test.com", result.getEmail());
    assertEquals("John Doe", result.getName());
    verify(userRepository, times(1)).save(any(User.class));
  }

  // Error scenario
  @Test
  void createUser_WithDuplicateEmail_ThrowsException() {
    CreateUserRequest request = new CreateUserRequest();
    request.setEmail("john@test.com");

    when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

    assertThrows(DuplicateResourceException.class,
      () -> userService.createUser(request));

    verify(userRepository, never()).save(any());
  }

  // Edge case
  @Test
  void getUserById_WithInvalidId_ThrowsNotFoundException() {
    when(userRepository.findById(999L)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class,
      () -> userService.getUserById(999L));
  }
}
```

### Integration Tests (Spring Boot Test)

```java
// src/test/java/com/example/user/UserControllerIntegrationTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserControllerIntegrationTest {

  @Autowired
  private TestRestTemplate restTemplate;

  @Autowired
  private UserRepository userRepository;

  @Test
  void createUser_WithValidData_Returns201() {
    // Arrange
    CreateUserRequest request = new CreateUserRequest();
    request.setEmail("newuser@test.com");
    request.setName("New User");
    request.setPassword("Password123");

    // Act
    ResponseEntity<ApiResponse<UserDTO>> response = restTemplate.postForEntity(
      "/api/users",
      request,
      new ParameterizedTypeReference<ApiResponse<UserDTO>>() {}
    );

    // Assert
    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertTrue(response.getBody().isSuccess());
    assertEquals("newuser@test.com", response.getBody().getData().getEmail());

    // Verify database
    User savedUser = userRepository.findByEmail("newuser@test.com").get();
    assertNotNull(savedUser);
  }

  @Test
  void getUser_WithInvalidId_Returns404() {
    ResponseEntity<ApiResponse<UserDTO>> response = restTemplate.getForEntity(
      "/api/users/999",
      new ParameterizedTypeReference<ApiResponse<UserDTO>>() {}
    );

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertFalse(response.getBody().isSuccess());
  }
}
```

## Mocking Strategies

### Frontend Mocking (vi.mock)

```javascript
// Mock entire module
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn()
  }
}));

// Use in test
import { authService } from '../services/authService';

it('should call login service', async () => {
  authService.login.mockResolvedValue({ token: 'abc123' });

  // Test code...

  expect(authService.login).toHaveBeenCalledWith('john@test.com', 'password');
});
```

### Backend Mocking (@Mock, @InjectMocks)

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private UserService userService;

  @Test
  void testWithMockedRepository() {
    when(userRepository.findById(1L))
        .thenReturn(Optional.of(new User()));

    // Test code...

    verify(userRepository).findById(1L);
  }
}
```

## Coverage Targets

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'vitest',
      reporter: ['text', 'html'],
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    }
  }
});
```

## Test Naming Convention

```javascript
// Frontend
describe('ComponentName', () => {
  it('should [expected behavior] when [condition]', () => {});
});

// Backend
class UserServiceTest {
  void testMethodName_WithCondition_ExpectsResult() {}
}
```

## Best Practices

1. **Test behavior, not implementation**
2. **Keep tests focused** (one assertion per test)
3. **Use descriptive names** (test intent, not syntax)
4. **Avoid test interdependencies** (tests should run in any order)
5. **Mock external dependencies** (APIs, databases)
6. **Use real data for integration tests**
7. **Test error cases** (not just happy path)
8. **Aim for 70%+ coverage**
9. **Keep tests maintainable** (refactor test code too)
10. **Run tests before committing** (CI/CD enforcement)
