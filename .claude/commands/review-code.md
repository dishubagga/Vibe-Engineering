# /review-code

> Orchestrates the Reviewer Agent to analyze code quality and security.

## Trigger
```
/review-code [file-or-directory]
```

## Workflow

1. **Load Reviewer Agent**: Invokes `agents/reviewer-agent.md`
2. **Collect Changes**: Gather files from path or recent git diff
3. **Analyze**:
   - Security vulnerabilities
   - Performance issues
   - Code duplication
   - Architecture violations
   - Best practice deviations
4. **Rate Issues**: Severity levels (critical/high/medium/low)
5. **Generate Report**: Actionable suggestions with line numbers

## Examples

```
/review-code src/components/Dashboard.jsx
/review-code backend/src/main/java/com/example/
/review-code                                     # Reviews all recent changes
```

## Checklist

✅ **Security**
- SQL injection vulnerabilities
- XSS vulnerabilities
- Exposed secrets/credentials
- CSRF protection
- Authentication/authorization

✅ **Performance**
- N+1 queries
- Unnecessary re-renders
- Memory leaks
- Inefficient algorithms
- Cache opportunities

✅ **Code Quality**
- Code duplication
- Function complexity
- Naming conventions
- Error handling
- Logging gaps

✅ **Architecture**
- SOLID principle violations
- Tight coupling
- Missing abstractions
- Scalability concerns
- Design patterns

## Output Format

```
## Code Review Report 🔍

### Overall Score: 8.5/10

### Issues Found
- 🔴 CRITICAL: SQL injection in UserRepository:45
- 🟠 HIGH: Missing error handling in fetchUser hook:23
- 🟡 MEDIUM: Code duplication in auth service:60
- 🔵 LOW: Inconsistent naming convention:12

### Suggestions
1. Use parameterized queries for all database access
2. Add try-catch block around API calls
3. Extract duplicate logic into shared function
4. Rename variables to camelCase

### Verdict: ⚠️ NEEDS CHANGES
```
