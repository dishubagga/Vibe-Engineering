# Quick Start — 8 Commands + 7 Agents

> Orchestrated full-stack development for React + Spring Boot + MongoDB.

## 🎯 The Big Picture

```
Command (what you type)
    ↓
Delegates to Agent (who does the work)
    ↓
Loads Skills (knowledge it needs)
    ↓
Generates Code / Analysis
```

---

## 📋 8 Commands at a Glance

```bash
/plan-feature "Add user authentication"       # 1. Plan features
/build-frontend "Create LoginForm component"  # 2. Build React
/build-backend "Create auth endpoint"         # 3. Build APIs
/build-db "Design users collection"           # 4. Design database
/review-code src/components/                  # 5. Review quality
/run-tests all --coverage                     # 6. Run tests
/fix-bug "TypeError: Cannot read property"    # 7. Fix bugs
/deploy production                            # 8. Deploy
```

---

## 🤖 7 Agents Behind the Scenes

| Agent | Does | Scope | Model |
|-------|------|-------|-------|
| **Architect** | Plans features, designs system | All | Sonnet |
| **Frontend** | Builds React components | `frontend/` | Sonnet |
| **Backend** | Builds Spring Boot APIs | `backend/` | Sonnet |
| **Database** | Designs MongoDB schemas | `database/` | Sonnet |
| **Reviewer** | Audits code quality | All | **Opus** |
| **DevOps** | Deploys, infrastructure | `docker/`, `.github/` | Sonnet |
| **QA** | Generates & runs tests | All | Sonnet |

---

## 🧠 11 Skills Available

### Frontend
- `react-patterns.md` — Components, hooks, folder structure
- `state-management.md` — Redux, Zustand, Context API

### Backend
- `spring-boot-patterns.md` — Controllers, services, DTOs
- `api-design.md` — REST conventions, versioning

### Database
- `mongodb-design.md` — Schema design, indexing

### Infrastructure
- `docker-best-practices.md` — Multi-stage builds, optimization
- `terraform-patterns.md` — Modular infrastructure

### Security & Testing
- `security.md` — JWT, validation, hashing
- `testing.md` — Unit, integration, E2E tests

---

## 🚀 Common Workflows

### 1. Build a New Feature

```bash
# 1. Plan it
/plan-feature Add shopping cart to the app

# 2. Build frontend
/build-frontend Create ShoppingCart component

# 3. Build backend
/build-backend Create /api/cart endpoints

# 4. Design database
/build-db Create cart collection with items

# 5. Review code
/review-code src/
/review-code backend/

# 6. Run tests
/run-tests all --coverage

# 7. Deploy
/deploy production
```

### 2. Fix a Bug

```bash
/fix-bug "Cannot read property 'map' of undefined"
  ↓ Agent analyzes root cause
  ↓ Generates minimal fix
  ↓ Adds regression test
  ↓ Runs /run-tests to verify
```

### 3. Security Update

```bash
/review-code              # Check for issues
/run-tests all            # Verify nothing broke
/deploy staging           # Test first
/deploy production        # Deploy to prod
```

---

## 💻 Examples

### Example 1: Create a Login Form

```bash
/build-frontend Create LoginForm component with email validation and password strength indicator
```

**Agent generates:**
- React component with validation
- Custom hooks for form state
- API service integration
- Error handling
- Loading states

### Example 2: Create Auth API

```bash
/build-backend Create JWT authentication service with login and token refresh endpoints
```

**Agent generates:**
- REST controller with auth endpoints
- Authentication service
- Password hashing with BCrypt
- JWT token generation/validation
- Global exception handler

### Example 3: Code Review

```bash
/review-code backend/src/main/java/com/example/auth/
```

**Reviewer Agent checks:**
- 🔴 Security vulnerabilities (SQL injection, XSS)
- 🟠 Performance issues (N+1 queries, memory leaks)
- 🟡 Code quality (duplication, complexity)
- 🔵 Best practices (SOLID principles, design patterns)

### Example 4: Run Tests

```bash
/run-tests all --coverage
```

**Output:**
```
Frontend: ✅ 45 passed, Coverage: 82%
Backend:  ✅ 128 passed, Coverage: 76%
Overall:  ✅ 173 tests passed
```

---

## 🏗️ Architecture Flow

```
You: /plan-feature "Add payments"
    ↓
Architect Agent:
  - Breaks into tasks
  - Defines API contracts
  - Plans database schema
  - Lists edge cases
    ↓
Output:
  Frontend Tasks: [Create PaymentForm, add Redux slice]
  Backend APIs: [POST /api/payments, GET /api/payments/{id}]
  Database: [payments collection with status enum]
  Edge cases: [Duplicate transactions, rate limiting]
    ↓
You review & approve
    ↓
/build-frontend "Create PaymentForm component"
    ↓
Frontend Agent loads react-patterns.md skill
    → Generates component with validation
    → Integrates with payment API
    → Adds loading/error states
    ↓
/build-backend "Create payments REST endpoint"
    ↓
Backend Agent loads spring-boot-patterns.md skill
    → Generates controller with @Valid
    → Generates service with transaction
    → Generates repository with queries
    ↓
/review-code src/ backend/
    ↓
Reviewer Agent (Opus model — stronger)
    → Security scan
    → Performance check
    → Generates detailed feedback
    ↓
/run-tests all
    ↓
QA Agent loads testing.md skill
    → Generates test cases
    → Runs unit + integration tests
    → Reports coverage (should be 70%+)
    ↓
/deploy production
    ↓
DevOps Agent loads docker-best-practices.md
    → Builds multi-stage Docker image
    → Sets up GitHub Actions
    → Configures environment variables
```

---

## 📊 Quality Gates

```
Code Generation
    ↓
/review-code ← Must pass (no CRITICAL issues)
    ↓
/run-tests all --coverage ← Must have 70%+ coverage
    ↓
/deploy staging ← Test in staging first
    ↓
/deploy production ← Go live!
```

---

## 🎨 Best Practices

### Do ✅

- Plan features before building (`/plan-feature`)
- Review code after implementation (`/review-code`)
- Run tests before deploying (`/run-tests`)
- Use staging before production (`/deploy staging`)
- Follow the generated code patterns
- Trust the Reviewer Agent (uses Opus model)

### Don't ❌

- Skip code review
- Deploy without tests
- Skip staging environment
- Ignore security warnings
- Modify generated test files manually
- Hardcode secrets (use env vars)

---

## 🔥 Power Moves

### 1. Batch Review
```bash
/review-code src/
/review-code backend/
# Reviews all recent changes
```

### 2. Full Test Coverage
```bash
/run-tests all --coverage
# Gets metrics for all tests
```

### 3. Auto-fix Bugs
```bash
/fix-bug "SyntaxError at line 45"
# Agent finds root cause, fixes, adds test
```

### 4. CI/CD Pipeline
```bash
/review-code
/run-tests all --coverage
/deploy production
# Full pipeline in one workflow
```

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| "Agent can't write to this directory" | Check agent scope in settings.json |
| "Tests failing" | Run `/fix-bug` with error message |
| "Security issues found" | Fix issues, re-run `/review-code` |
| "Deployment error" | Deploy to staging first: `/deploy staging` |
| "Need to understand code" | Run `/review-code` for detailed analysis |

---

## 📚 Learn More

- **Full commands?** → `commands/` directory
- **Agent details?** → `agents/` directory
- **Code patterns?** → `skills/` directory
- **Project setup?** → `CLAUDE.md`
- **Full docs?** → `README.md`

---

## 🎯 Next Steps

1. **Read** `CLAUDE.md` (project instructions)
2. **Start** with `/plan-feature` for your first feature
3. **Build** with `/build-frontend` and `/build-backend`
4. **Review** with `/review-code`
5. **Test** with `/run-tests all --coverage`
6. **Deploy** with `/deploy production`

**Good luck! 🚀**

---

**v2.0** | 8 Commands • 7 Agents • 11 Skills
