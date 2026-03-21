# /fix-bug

> Orchestrates agents to diagnose and fix bugs with regression prevention.

## Trigger
```
/fix-bug <error-message-or-description>
```

## Workflow

1. **Analyze Error**: Parse stack trace or description
2. **Identify Root Cause**:
   - Backend Agent: Debug Java/Spring issues
   - Frontend Agent: Debug React/JavaScript issues
   - Database Agent: Debug query/schema issues
3. **Generate Fix**:
   - Minimal code change
   - Target only the root cause
   - Add logging for future debugging
4. **Regression Prevention**:
   - Write test case to catch this bug
   - Update related tests
   - Document the issue
5. **Verify**: Run `/run-tests` to ensure fix works

## Examples

```
/fix-bug TypeError: Cannot read property 'map' of undefined
/fix-bug NullPointerException in UserService line 45
/fix-bug Duplicate key error on users.email unique constraint
/fix-bug "No route matches [GET] /api/users"
```

## Workflow Steps

### 1. Root Cause Analysis
- Examine error stack trace
- Check recent code changes
- Review related configurations
- Identify the actual problem (not the symptom)

### 2. Generate Fix
- Minimal code modification
- Follow project conventions
- Add comments explaining the fix
- Include error handling

### 3. Add Regression Test
```javascript
// Frontend example
it('should handle undefined data gracefully', () => {
  const { result } = renderHook(() => useUsers(undefined));
  expect(result.current.users).toEqual([]);
});
```

```java
// Backend example
@Test
void testCreateUser_WithDuplicateEmail_ThrowsException() {
  userService.createUser(validRequest);
  assertThrows(DuplicateResourceException.class,
    () -> userService.createUser(sameEmailRequest));
}
```

### 4. Output Format

```
## Bug Fix Report

### Error
TypeError: Cannot read property 'map' of undefined at line 45

### Root Cause
useUsers hook returns null before API call completes.
Component tries to map over null data.

### Fix Applied
```javascript
const users = data?.users || [];
return users.map(user => <UserCard key={user.id} {...user} />);
```

### Prevention
Added test case: "should handle undefined data gracefully"

### Regression Status
✅ All tests pass
✅ No new warnings
```
