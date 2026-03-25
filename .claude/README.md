# Claude Code: Full-Stack Development System

> **8 Commands + 7 Agents + 11 Skills** for React + Spring Boot + MongoDB development.

## 🎯 Core Architecture

```
User Command
    ↓
Command File (orchestrates workflow)
    ↓
Agents (specialized workers)
    ↓
Skills (knowledge bases)
    ↓
Code Generation / Analysis
```

---

## 📋 Commands (8 User-Facing Slash Commands)

| Command | Purpose | Delegates To | Output |
|---------|---------|--------------|--------|
| **`/plan-feature`** | Break down features | Architect Agent | Feature plan with tasks, APIs, DB schema |
| **`/build-frontend`** | Build React components | Frontend Agent | Components, hooks, state management |
| **`/build-backend`** | Build Spring Boot services | Backend Agent | Controllers, services, repositories |
| **`/build-db`** | Design MongoDB schemas | Database Agent | Collections, indexes, relationships |
| **`/review-code`** | Code quality review | Reviewer Agent | Issues found, severity ratings, fixes |
| **`/review-git-diff`** | Uncommitted code review | Git Diff Reviewer | Logical issues, diff-specific regressions |
| **`/run-tests`** | Generate & run tests | QA Agent | Test results, coverage reports |
| **`/fix-bug`** | Debug and fix issues | Appropriate Agent | Root cause, fix, regression tests |
| **`/deploy`** | Deploy to production | DevOps Agent | Docker, GitHub Actions, env config |

---

## 🤖 Agents (7 Specialized Workers)

Each agent has specific responsibilities, constraints, and expertise.

| Agent | Role | Model | Scope | Can Write |
|-------|------|-------|-------|-----------|
| **Architect** | System design & planning | Sonnet | All dirs | No (design only) |
| **Frontend** | React components & state | Sonnet | frontend/ | Yes |
| **Backend** | Spring Boot services | Sonnet | backend/ | Yes |
| **Database** | MongoDB schema design | Sonnet | database/ | Yes |
| **Reviewer** | Code quality & security | **Opus** | All dirs | No (read-only) |
| **Git Diff Reviewer** | Diff logic & reasoning | **o3-mini** | All dirs | No (read-only) |
| **DevOps** | Infrastructure & deployment | Sonnet | docker/, .github/, tf/ | Yes |
| **QA** | Test generation & coverage | Sonnet | All dirs | Yes |

### Agent Workflow

```
/plan-feature "Add user authentication"
    → Architect Agent
        → Breaks into tasks
        → Defines API contracts
        → Plans DB schema
        → Lists edge cases

Then:

/build-frontend "Create LoginForm component"
    → Frontend Agent
        → Implements component
        → Adds state management
        → Integrates with API
        → Awaits /review-code

/build-backend "Create auth endpoint"
    → Backend Agent
        → Implements controller
        → Adds service logic
        → Creates repository
        → Awaits /review-code

/review-code backend/
    → Reviewer Agent
        → Security scan
        → Performance check
        → Best practice validation
        → Provides feedback

/run-tests all
    → QA Agent
        → Generates test cases
        → Runs tests
        → Reports coverage
```

---

## 🧠 Skills (11 Knowledge Bases)

Knowledge modules that agents use to generate code.

### Frontend Skills

| Skill | Purpose |
|-------|---------|
| **react-patterns.md** | Functional components, hooks, folder structure, error boundaries |
| **state-management.md** | Redux Toolkit, Zustand, Context API patterns |

### Backend Skills

| Skill | Purpose |
|-------|---------|
| **spring-boot-patterns.md** | Controllers, services, repositories, DTOs, exception handling |
| **api-design.md** | REST conventions, status codes, versioning, pagination, filtering |

### Database Skills

| Skill | Purpose |
|-------|---------|
| **mongodb-design.md** | Schema design, embedding vs referencing, indexing, relationships |

### Infrastructure Skills

| Skill | Purpose |
|-------|---------|
| **docker-best-practices.md** | Multi-stage builds, layer caching, image optimization, security |
| **terraform-patterns.md** | Modular infrastructure, environment separation, state management |

### Cross-Cutting Skills

| Skill | Purpose |
|-------|---------|
| **security.md** | JWT auth, input validation, XSS prevention, password hashing, CORS |
| **testing.md** | Unit tests, integration tests, E2E, mocking, coverage targets |

---

## 🚀 Typical Workflows

### Feature Development Cycle

```bash
# 1. Plan the feature
/plan-feature Add shopping cart functionality
    ↓ Review the plan
    ↓ Architect outputs frontend/backend/DB tasks

# 2. Build frontend
/build-frontend Create ShoppingCart component with items list
    ↓ Frontend Agent builds component
    ↓ Awaits review

# 3. Build backend
/build-backend Create /api/cart endpoints for add/remove/checkout
    ↓ Backend Agent builds REST API
    ↓ Awaits review

# 4. Design database
/build-db Create Cart collection with items and user reference
    ↓ Database Agent designs schema and indexes

# 5. Review code
/review-code frontend/src/components/ShoppingCart
/review-code backend/src/main/java/com/example/cart/
    ↓ Reviewer Agent checks security, performance, architecture
    ↓ Provides feedback

# 6. Generate tests
/run-tests all --coverage
    ↓ QA Agent generates test cases
    ↓ Runs tests and coverage report
    ↓ Should achieve 70%+ coverage

# 7. Deploy
/deploy production
    ↓ DevOps Agent builds Docker image
    ↓ Sets up GitHub Actions CI/CD
    ↓ Prepares environment config
    ↓ Ready for production deployment
```

### Bug Fix Workflow

```bash
/fix-bug "TypeError: Cannot read property 'map' of undefined"
    ↓ Agent analyzes error
    ↓ Identifies root cause
    ↓ Generates minimal fix
    ↓ Adds regression test
    ↓ Verifies with /run-tests
```

### Security Update Workflow

```bash
/review-code                    # Scan for vulnerabilities
    ↓
/security check                 # (if needed)
    ↓
/run-tests all --coverage       # Verify nothing broke
    ↓
/deploy staging                 # Test in staging first
    ↓
/deploy production              # Deploy to prod
```

---

## 📂 Directory Structure

```
.claude/
├── CLAUDE.md                   # Project instructions (checked into repo)
├── QUICKSTART.md               # Quick reference (this file)
├── README.md                   # Full documentation
├── settings.json               # Claude Code configuration
│
├── commands/ (8 files)
│   ├── plan-feature.md
│   ├── build-frontend.md
│   ├── build-backend.md
│   ├── build-db.md
│   ├── review-code.md
│   ├── review-git-diff.md
│   ├── run-tests.md
│   ├── fix-bug.md
│   └── deploy.md
│
├── agents/ (7 files)
│   ├── architect-agent.md      # System design
│   ├── frontend-agent.md       # React development
│   ├── backend-agent.md        # Spring Boot development
│   ├── database-agent.md       # MongoDB design
│   ├── reviewer-agent.md       # Code review
│   ├── git-diff-reviewer-agent.md # Git diff code review
│   ├── devops-agent.md         # Infrastructure
│   └── qa-agent.md             # Testing
│
└── skills/ (11 files)
    ├── react-patterns.md
    ├── state-management.md
    ├── spring-boot-patterns.md
    ├── api-design.md
    ├── mongodb-design.md
    ├── docker-best-practices.md
    ├── terraform-patterns.md
    ├── security.md
    ├── testing.md
    └── (2 additional cross-cutting skills)
```

---

## 💡 Key Principles

### Agent Autonomy

Each agent operates independently within its scope:

- **Architect**: Never writes code (design only)
- **Reviewer**: Never modifies code (read-only)
- **Others**: Write code in their designated directories

### Skill Reusability

Skills are referenced by agents via commands:

```
Command → Agent → Loads Skills → Generates Code
```

### Workflow Orchestration

Commands chain agents together:

```
/plan-feature
    ↓
User reviews plan
    ↓
/build-frontend (follows the plan)
/build-backend (follows the plan)
```

### Quality Gates

Multiple checkpoints ensure code quality:

```
Code → /review-code → Issues found?
         ↓                  ↓
       Approved       Fix and resubmit
         ↓
    /run-tests → Coverage 70%?
                 ↓              ↓
              Pass         Add tests
                 ↓
            /deploy
```

---

## ⚙️ Configuration

### settings.json

```json
{
  "agents": {
    "architect-agent": {
      "model": "claude-sonnet",
      "readOnly": true,
      "scope": "all"
    },
    "frontend-agent": {
      "model": "claude-sonnet",
      "scope": "frontend/"
    },
    "reviewer-agent": {
      "model": "claude-opus-4-6",
      "readOnly": true
    }
  },
  "permissions": {
    "allow": ["Edit", "Read", "Bash(npm)"],
    "ask": ["Bash(git commit)", "Bash(git push)"]
  }
}
```

---

## 🎓 Example: Build a User Management Feature

### Step 1: Plan

```bash
/plan-feature Build user management (create, list, edit, delete)
```

**Output:**
```
Frontend Tasks:
  - UserList component (pagination, filtering)
  - UserForm component (create/edit)
  - UserCard component (display)

Backend APIs:
  - GET /api/users (with pagination)
  - GET /api/users/{id}
  - POST /api/users (create)
  - PUT /api/users/{id} (update)
  - DELETE /api/users/{id}

Database:
  - users collection with email unique index
  - created_at index for sorting

Edge Cases:
  - Duplicate email
  - Invalid data format
  - Concurrent updates
  - Soft delete vs hard delete
```

### Step 2: Implement Frontend

```bash
/build-frontend Create UserList component with pagination and filtering
/build-frontend Create UserForm component for create/edit operations
```

**Generated:**
- `src/components/UserList.jsx`
- `src/components/UserForm.jsx`
- `src/services/userService.js`
- `src/store/slices/userSlice.js`

### Step 3: Implement Backend

```bash
/build-backend Create User REST endpoints with CRUD operations
```

**Generated:**
- `UserController.java`
- `UserService.java`
- `UserRepository.java`
- `User.java` (entity)
- `UserDTO.java` (DTO)

### Step 4: Design Database

```bash
/build-db Create users collection with validation and indexes
```

**Generated:**
- Collection schema with validation
- Unique index on email
- Index on createdAt for sorting

### Step 5: Review & Test

```bash
/review-code src/components/
/review-code backend/src/main/java/com/example/user/
/run-tests all --coverage
```

### Step 6: Deploy

```bash
/deploy production
```

---

## 🔄 Continuous Integration

### Pre-commit Hooks (CI/CD)

```bash
# Automatically runs before commit
/run-tests all
/security-check all
/review-code
```

### GitHub Actions

```yaml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: /run-tests all --coverage
      - run: /review-code
      - run: /security-check all
```

---

## 📖 Quick Reference

### Commands
```bash
/plan-feature <description>           # Plan a feature
/build-frontend <task>                # Build React component
/build-backend <task>                 # Build Spring Boot service
/build-db <description>               # Design MongoDB collection
/review-code [path]                   # Review code quality
/review-git-diff [branch|commit]      # Review uncommitted changes
/run-tests [scope] [--coverage]       # Run tests
/fix-bug <error>                      # Debug and fix issue
/deploy [environment]                 # Deploy to prod/staging
```

### Agents (Auto-selected by commands)
```
Architect → Plan, Design
Frontend → Build React
Backend → Build APIs
Database → Design schemas
Reviewer → Quality check (Opus model)
Git Diff Reviewer → Logic check for diffs (o3-mini model)
DevOps → Deploy, Infrastructure
QA → Generate tests
```

### Skills (Auto-loaded by agents)
- React patterns
- State management
- Spring Boot patterns
- API design
- MongoDB design
- Docker best practices
- Terraform patterns
- Security
- Testing

---

## ✅ Checklist: Ready for Production?

- [ ] All features planned with `/plan-feature`
- [ ] Frontend built with `/build-frontend`
- [ ] Backend built with `/build-backend`
- [ ] Database designed with `/build-db`
- [ ] Code reviewed with `/review-code`
- [ ] Tests passing with `/run-tests all --coverage` (70%+)
- [ ] Security checked
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Deployment tested in staging
- [ ] Ready for `/deploy production`

---

## 🆘 Troubleshooting

### "Agent can't modify code in this directory"
→ Agent scope is limited. Check settings.json or request correct agent.

### "Code review found security issues"
→ Fix issues reported by Reviewer Agent, then `/review-code` again.

### "Tests failing after changes"
→ Run `/fix-bug` with error message or add tests with `/run-tests`.

### "Deployment failed"
→ Check logs with `/deploy staging` first before prod.

---

## 📞 Support

- **Questions about commands?** Read `.claude/commands/`
- **Code examples?** Read `.claude/skills/`
- **Agent behavior?** Read `.claude/agents/`
- **Project setup?** Read `CLAUDE.md`

---

**Last Updated:** 2024-12-20
**Version:** 2.0.0
**Architecture:** Command → Agent → Skill → Code Generation
