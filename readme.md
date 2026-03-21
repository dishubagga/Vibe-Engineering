# Full-Stack Application — React + Java Spring Boot

A modern full-stack application with React frontend (with Redux/Zustand/Context state management) and Java Spring Boot backend, complete with AI-powered development tools and security scanning.

## 🏗️ Architecture

### Application Stack
| Layer | Technology | Port |
|-------|------------|------|
| **Frontend** | React 18.2.0 + Vite | 5173 |
| **State Management** | Redux/Zustand/Context | — |
| **Backend** | Spring Boot 3.2.0 + Java 17+ | 8080 |
| **Database** | PostgreSQL / MySQL | — |
| **Security** | Spring Security + JWT | — |

### Development Workflow (`.claude/`)
| Component | Purpose |
|-----------|---------|
| **Commands** | Slash commands: `/build-frontend-react`, `/build-backend-spring`, `/test-suite`, `/security-check`, etc. |
| **Skills** | Knowledge bases: react-state-patterns, spring-boot-patterns, dependency-management |
| **Agents** | Specialized AI workers for frontend, backend, and code review |
| **Settings** | Claude Code configuration and permissions |

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or 20.x LTS
- Java 17 LTS or 21 LTS
- Maven 3.9.x
- Database (PostgreSQL recommended)

### Setup

```bash
# Frontend
cd frontend
npm install
npm run dev                    # Runs on http://localhost:5173

# Backend (in another terminal)
cd backend
./mvnw spring-boot:run        # Runs on http://localhost:8080
```

### Environment Variables

**Frontend** — `.env`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

**Backend** — `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/myapp
    username: postgres
    password: password
  jpa:
    hibernate:
      ddl-auto: update
server:
  port: 8080
```

## 📁 Project Structure

```
├── CLAUDE.md                    # Project instructions for AI agents
├── .claude/                     # AI Development Workflow
│   ├── commands/                # Slash commands
│   │   ├── build-frontend-react.md
│   │   ├── build-backend-spring.md
│   │   ├── test-suite.md
│   │   ├── security-check.md
│   │   ├── manage-versions.md
│   │   └── README.md
│   ├── skills/                  # Knowledge bases
│   │   ├── react-state-patterns.md
│   │   ├── spring-boot-patterns.md
│   │   └── dependency-management.md
│   └── settings.json            # Claude Code config
│
├── frontend/                    # React + State Management
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx             # Entry point
│       ├── store/               # Redux/Zustand store
│       ├── components/          # Reusable components
│       ├── pages/               # Page components
│       ├── hooks/               # Custom hooks
│       ├── services/            # API & Socket.IO client
│       └── styles/              # CSS/Tailwind
│
└── backend/                     # Spring Boot
    ├── pom.xml
    ├── src/main/java/com/example/
    │   ├── DemoApplication.java
    │   ├── config/              # Security, DB config
    │   ├── user/
    │   │   ├── controller/      # REST endpoints
    │   │   ├── service/         # Business logic
    │   │   ├── repository/      # Data access
    │   │   ├── entity/          # JPA entities
    │   │   └── dto/             # Data transfer objects
    │   ├── order/               # (Repeat structure)
    │   └── common/
    │       ├── exception/       # Global exception handling
    │       ├── dto/             # Shared DTOs
    │       └── config/          # Global config
    └── src/test/java/           # Tests
```

## 🛠️ AI-Powered Development Commands

All commands use Claude AI to generate code following project patterns.

### Frontend Development
```bash
# Create React components
/build-frontend-react Create a UserProfile component with form validation
/build-frontend-react Add Redux slice for managing cart items
/build-frontend-react Build useApi custom hook for data fetching
```

### Backend Development
```bash
# Create Spring Boot services
/build-backend-spring Create User REST endpoint with CRUD operations
/build-backend-spring Build OrderService with transaction management
/build-backend-spring Create custom repository with pagination
```

### Testing
```bash
# Run tests with coverage
/test-suite all                    # Everything
/test-suite frontend --coverage    # React tests
/test-suite backend                # Spring Boot tests
/test-suite --watch                # Watch mode
```

### Security Scanning
```bash
# Comprehensive security checks
/security-check all                # Full scan (npm audit + Maven audit)
/security-check frontend           # npm audit only
/security-check backend            # Maven audit only
/security-check secrets            # Find exposed credentials
/security-check --fix              # Auto-fix vulnerabilities
```

### Dependency Management
```bash
# Manage versions
/manage-versions check             # Check current status
/manage-versions report            # View available updates
/manage-versions update security   # Security patches
/manage-versions lock              # Lock current versions
```

## 🔐 Security & Versions

### Pinned Versions
These versions are locked and only updated intentionally:

**Frontend:**
- React 18.2.0
- Vite 5.0.0
- TypeScript 5.3.0

**Backend:**
- Spring Boot 3.2.0
- Java 17 LTS (or 21 LTS)
- Maven 3.9.x

To update: Use `/manage-versions update` then `/manage-versions lock`

### Security Scanning
Run `/security-check all` to:
- ✅ Scan npm and Maven dependencies
- ✅ Detect code vulnerabilities (SQL injection, XSS, CSRF)
- ✅ Find exposed secrets (API keys, credentials)
- ✅ Verify Spring Security configuration
- ✅ Check CORS and headers

## 📦 Key Patterns

### Frontend State Management

**Redux Toolkit (Large Apps):**
```javascript
const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.data = action.payload;
    });
  }
});
```

**Zustand (Lightweight):**
```javascript
export const useUserStore = create((set) => ({
  user: null,
  fetchUser: async (id) => {
    const data = await fetch(`/api/users/${id}`).then(r => r.json());
    set({ user: data });
  }
}));
```

### Backend REST API

**Controller:**
```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
  private final UserService userService;

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<UserDTO>> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
  }
}
```

**Service:**
```java
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
  private final UserRepository userRepository;

  public UserDTO getUserById(Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    return UserDTO.fromEntity(user);
  }
}
```

## 🧪 Testing Standards

**Frontend Test (Vitest + React Testing Library):**
```javascript
describe('UserCard', () => {
  it('renders user information', () => {
    const user = { id: 1, name: 'John', email: 'john@test.com' };
    render(<UserCard user={user} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

**Backend Test (JUnit 5 + Mockito):**
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private UserService userService;

  @Test
  void testGetUserById_Success() {
    User user = new User();
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    UserDTO result = userService.getUserById(1L);
    assertNotNull(result);
  }
}
```

**Coverage Targets:** 70%+ for both frontend and backend

## 📚 Documentation

- **[`.claude/README.md`](.claude/README.md)** — Complete AI commands reference
- **[`CLAUDE.md`](CLAUDE.md)** — Project instructions for AI agents
- **[`.claude/skills/`](.claude/skills/)** — Code patterns and best practices

## 🚀 Deployment

### Frontend
```bash
npm run build                      # Build for production
# Deploy `dist/` folder to CDN/hosting
```

### Backend
```bash
./mvnw clean package               # Build JAR
java -jar target/app.jar           # Run JAR
# Or use Docker/Kubernetes
```

## 🔄 Development Workflow

1. **Create Feature**
   ```bash
   /build-frontend-react Add dashboard widget
   /build-backend-spring Create /api/stats endpoint
   ```

2. **Test Locally**
   ```bash
   /test-suite all --coverage
   ```

3. **Security Check**
   ```bash
   /security-check all
   ```

4. **Code Review**
   ```bash
   /review-code src/components/
   /review-code backend/src/main/java/
   ```

5. **Deploy**
   ```bash
   /deploy production
   ```

## 📋 Coding Standards

### Frontend
- ✅ Functional components with hooks
- ✅ Keep state normalized
- ✅ Use custom hooks for logic
- ✅ Separate API calls into service layer
- ✅ Handle loading/error/success states
- ❌ Don't put all state in one store
- ❌ Don't make API calls in components

### Backend
- ✅ Use `@Transactional` on services
- ✅ Validate all inputs
- ✅ Use DTOs for request/response
- ✅ Handle exceptions globally
- ✅ Log important operations
- ❌ Don't store secrets in code
- ❌ Don't skip database validation
- ❌ Don't expose sensitive errors

## 🆘 Troubleshooting

**Port already in use:**
```bash
# Frontend (5173)
lsof -ti:5173 | xargs kill

# Backend (8080)
lsof -ti:8080 | xargs kill
```

**Version mismatch:**
```bash
/manage-versions check
/manage-versions lock
```

**Test failures:**
```bash
/test-suite all --verbose
```

**Security vulnerabilities:**
```bash
/security-check all --fix
/manage-versions update security
/test-suite all
```

## 📞 Support

- Check `.claude/README.md` for complete command reference
- Review `.claude/skills/` for code patterns
- Run `/security-check all` for vulnerability reports
- Run `/manage-versions report` for dependency status

## 📄 License

This project is generic and works with any React + Spring Boot stack.
