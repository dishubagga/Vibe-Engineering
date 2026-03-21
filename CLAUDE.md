# Project Instructions for AI Agents

> This file is read by AI agents before they start working on this project. Customize it for your specific domain knowledge.

## Project Overview

A full-stack application with **React** frontend and **Java Spring Boot** backend.

| Layer | Tech | Port |
|-------|------|------|
| Frontend | React 18.2.0 + Vite | 5173 |
| State Management | Redux/Zustand/Context | — |
| Backend | Spring Boot 3.2.0 | 8080 |
| Database | PostgreSQL/MySQL | — |

## Tech Stack Rules

### Frontend
- **Framework**: React 18.2.0 (locked version)
- **Build Tool**: Vite
- **State**: Redux Toolkit, Zustand, or Context API
- **Styling**: Tailwind CSS, CSS-in-JS, or SCSS
- **Testing**: Vitest + React Testing Library
- **HTTP**: Fetch API or Axios with custom hooks
- **Type Safety**: TypeScript (optional but recommended)

### Backend
- **Language**: Java 17 LTS (minimum)
- **Framework**: Spring Boot 3.2.0
- **Data**: Spring Data JPA + Hibernate
- **Security**: Spring Security + JWT/OAuth
- **Testing**: JUnit 5 + Mockito
- **Build**: Maven 3.9.x
- **Database**: PostgreSQL or MySQL

### General Rules
- Use **ES6+ async/await** for async operations
- Follow **RESTful API** conventions
- Use **DTOs** for API request/response
- Implement **proper error handling** with meaningful messages
- Write **unit + integration tests**
- Use **dependency injection** everywhere
- Keep components/services **focused and reusable**
- Follow **SOLID principles**

## File Structure

```
project/
├── CLAUDE.md                    # ← You are here
├── readme.md                    # Public documentation
├── .claude/                     # Development workflow
│   ├── commands/                # Slash commands
│   ├── skills/                  # Code patterns & knowledge
│   ├── agents/                  # AI workers
│   ├── hooks/                   # Auto-reactions
│   ├── settings.json            # Config
│   └── README.md                # Command reference
│
├── frontend/                    # React + Vite
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx             # Entry point
│   │   ├── store/               # State management
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page-level components
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API client, utilities
│   │   └── styles/              # Global styles
│   └── __tests__/               # Tests
│
└── backend/                     # Spring Boot
    ├── pom.xml
    ├── src/main/java/com/example/
    │   ├── Application.java      # Entry point
    │   ├── config/               # Spring config
    │   ├── domain1/              # Domain module
    │   │   ├── controller/       # REST controllers
    │   │   ├── service/          # Business logic
    │   │   ├── repository/       # Data access
    │   │   ├── entity/           # JPA entities
    │   │   └── dto/              # Data transfer objects
    │   └── common/
    │       ├── exception/        # Exception handling
    │       ├── dto/              # Shared DTOs
    │       └── config/           # Global config
    └── src/test/java/            # Tests
```

## Coding Conventions

### Frontend (JavaScript/React)
1. **Naming**: `camelCase` for variables/functions, `PascalCase` for components/classes
2. **Imports**: Use ES6 `import` statements
3. **Components**: Functional components with hooks only
4. **Props**: Destructure props in component signatures
5. **State**: Use hooks (useState, useReducer) or store
6. **Error Handling**: Always try/catch async operations
7. **Comments**: Only for "why", not "what"
8. **Formatting**: Use Prettier, 2-space indentation

### Backend (Java/Spring)
1. **Naming**: `camelCase` for variables/methods, `PascalCase` for classes
2. **Access Modifiers**: Use `private` by default
3. **Annotations**: Use Spring annotations (`@Service`, `@Repository`, etc.)
4. **Dependency Injection**: Use constructor injection with `@RequiredArgsConstructor`
5. **Transactions**: Use `@Transactional` on service methods
6. **Logging**: Use SLF4J with `@Slf4j` annotation
7. **Error Handling**: Throw custom exceptions, catch at controller level
8. **Comments**: Only for complex logic
9. **Formatting**: Use 4-space indentation

## Versions (PINNED)

These versions are locked and only updated intentionally:

**Frontend** (in `frontend/package.json`):
```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "vite": "5.4.2",
  "vitest": "2.0.5",
  "typescript": "5.6.2",
  "axios": "1.13.6",
  "react-router-dom": "6.30.3",
  "eslint": "8.56.0",
  "@vitejs/plugin-react": "4.3.1"
}
```

**Backend** (in `backend/pom.xml`):
```xml
<spring.boot.version>3.2.0</spring.boot.version>
<java.version>17</java.version>
<maven.version>3.9.x</maven.version>
```

To update: Use `/manage-versions` command.

## Available AI Commands

| Command | Purpose |
|---------|---------|
| `/build-frontend-react <task>` | Create/modify React components |
| `/build-backend-spring <task>` | Create/modify Spring Boot services |
| `/test-suite [scope]` | Run tests with coverage |
| `/security-check [scope]` | Scan for vulnerabilities |
| `/manage-versions [cmd]` | Check/update pinned versions |
| `/review-code [path]` | AI code review |

See `.claude/README.md` for detailed documentation.

## Security Rules

- **No secrets in code**: Use environment variables
- **Input validation**: Always validate user input
- **SQL injection prevention**: Use parameterized queries (JPA handles this)
- **XSS prevention**: Sanitize user-generated HTML
- **CSRF protection**: Enable in Spring Security
- **CORS**: Configure explicitly, not `*`
- **Authentication**: Use JWT or OAuth2 via Spring Security
- **Run security checks**: `/security-check all` before deployments

## API Response Format

All API responses must follow this format:

```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Success message",
  "code": 200,
  "timestamp": "2024-12-20T10:00:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "code": 400,
  "timestamp": "2024-12-20T10:00:00Z"
}
```

## Testing Requirements

- **Frontend**: Unit tests for components, hooks, utilities (target: 70%+ coverage)
- **Backend**: Unit tests for services, integration tests for controllers (target: 70%+ coverage)
- **Test files**: Place tests next to source files with `.test.js` or `Test.java` suffix
- **Run tests**: `/test-suite all --coverage` before committing

## Local Development

### Setup
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend (in another terminal)
cd backend && ./mvnw spring-boot:run
```

### Environment
Create `.env` files:

**frontend/.env**:
```
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

**backend/src/main/resources/application-dev.yml**:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/myapp
    username: postgres
    password: password
```

## Don'ts ⛔

- ❌ Don't commit `.env` files with secrets
- ❌ Don't use hardcoded API endpoints
- ❌ Don't skip input validation
- ❌ Don't use `var` in JavaScript
- ❌ Don't use raw SQL queries (use JPA)
- ❌ Don't modify `.claude/` files without asking
- ❌ Don't update pinned versions without `/manage-versions lock`
- ❌ Don't disable security features
- ❌ Don't skip tests before commits
- ❌ Don't commit with security vulnerabilities

## Domain Knowledge

> **CUSTOMIZE THIS SECTION** with your project's specific business logic, entities, workflows, and terminology.

Example (ride-sharing):
```
User Types: Riders, Drivers, Admins
Ride Lifecycle: REQUESTED → MATCHED → IN_PROGRESS → COMPLETED → REVIEWED
Key Entities: User, Ride, Driver, Review, Rating
Constraints: Driver must be verified, rides require payment info, ratings 1-5
```

Update with your project's actual domain.

## Questions for Claude AI

When working on this project, Claude will:
1. ✅ Ask clarifying questions if requirements are ambiguous
2. ✅ Suggest improvements to patterns and architecture
3. ✅ Run `/security-check` before major changes
4. ✅ Ensure tests pass and coverage is maintained
5. ✅ Follow the style guides in `.claude/skills/`
6. ✅ **Always create a step-by-step plan before executing any command or slash command**, and wait for user confirmation before proceeding

## Optional Components (Add When Project Grows)

These are **not required** for basic setup but enhance the experience:

### Agents (Optional)
Create specialized AI workers with custom instructions:

```
.claude/agents/
├── frontend-agent.md    # Specialized for React tasks
├── backend-agent.md     # Specialized for Spring Boot tasks
└── reviewer-agent.md    # Specialized for code reviews
```

**Add when:**
- You want custom agent behavior beyond default commands
- You have complex project-specific requirements
- You need agents to follow specialized instructions

**How to add:**
1. Create `.claude/agents/` directory
2. Create agent definition files with responsibilities and constraints
3. Reference in command files under "Delegate to Agent"

### Hooks (Optional)
Auto-reactions triggered by events:

```
.claude/hooks/
├── pre-commit-lint.sh           # Auto-lint before commits
├── post-build-notify.sh         # Notify after builds
└── before-deploy-security.sh    # Run security check before deploy
```

**Add when:**
- You want automated enforcement of standards
- You need pre/post processing of events
- You want to prevent bad practices automatically

**How to add:**
1. Create `.claude/hooks/` directory
2. Create shell scripts for each hook
3. Register in `settings.json` under hooks section
4. Claude Code harness will execute them automatically

---

## Last Updated
- Date: 2024-12-20
- React: 18.2.0
- Spring Boot: 3.2.0
- Java: 17 LTS
- Status: Generic, minimal, production-ready
