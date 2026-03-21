# /plan-feature

> Orchestrates the Architect Agent to break down features into actionable tasks.

## Trigger
```
/plan-feature <feature-description>
```

## Workflow

1. **Load Architect Agent**: Invokes `agents/architect-agent.md`
2. **Analyze Requirements**: Parse feature description
3. **Break Down**:
   - Frontend tasks (components, state, routing)
   - Backend APIs (endpoints, database queries)
   - Database schema changes
   - Edge cases & error scenarios
   - Validation rules
4. **Output**: Structured plan with dependencies and timeline

## Examples

```
/plan-feature Add user authentication with JWT tokens
/plan-feature Implement shopping cart functionality
/plan-feature Build admin dashboard for order management
/plan-feature Create real-time notifications system
```

## Output Format

```
## Feature Plan: [Name]

### Frontend Tasks
- [ ] Component 1
- [ ] State management setup
- [ ] API integration

### Backend APIs
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register
- [ ] GET /api/user/profile

### Database Schema
- Users table (email, password_hash, created_at)
- Sessions table (user_id, token, expires_at)

### Edge Cases
- Duplicate email registration
- Token expiration
- Concurrent login attempts

### Validation Rules
- Email format & uniqueness
- Password strength (min 8 chars)
- Token TTL: 24 hours
```

## Who Uses This

- **Architect Agent**: Primary user
- **Frontend/Backend Agents**: Receive tasks from this plan
- **QA Agent**: Uses plan for test case generation
