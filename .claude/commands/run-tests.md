# /run-tests

> Orchestrates the QA Agent to generate and run tests.

## Trigger
```
/run-tests [scope] [--coverage] [--watch]
```

## Workflow

1. **Load QA Agent**: Invokes `agents/qa-agent.md`
2. **Load Skills**: testing.md
3. **Generate Test Cases**:
   - Happy path scenarios
   - Edge cases
   - Error/failure scenarios
   - Integration tests
4. **Run Tests**:
   - Frontend: npm run test (with coverage)
   - Backend: ./mvnw test (with jacoco)
5. **Report Coverage**: Generate HTML reports

## Examples

```
/run-tests all                     # Frontend + Backend + Integration
/run-tests frontend --coverage     # React tests with coverage report
/run-tests backend                 # Spring Boot tests
/run-tests --watch                 # Watch mode for development
/run-tests e2e                     # End-to-end tests
```

## Scopes

| Scope | What It Runs |
|-------|--------------|
| `all` | Frontend + Backend + Integration |
| `frontend` | React unit + component tests |
| `backend` | Spring Boot unit + integration |
| `unit` | Unit tests only (both stacks) |
| `integration` | Integration tests only |
| `e2e` | End-to-end tests |
| `watch` | Watch mode for development |

## Flags

- **--coverage**: Generates code coverage reports (HTML + JSON)
- **--watch**: Runs tests in watch mode (development)
- **--verbose**: Detailed output with stack traces
- **--ci**: CI mode (non-interactive, stricter)

## Coverage Targets

- **Frontend**: 70%+ (lines, functions, branches)
- **Backend**: 70%+ (lines, functions, branches)

## Test Generation

QA Agent generates test cases for:
- Happy path (expected behavior)
- Edge cases (boundary conditions)
- Error scenarios (invalid input, network failures)
- Integration (API contracts, database)

## Output Format

```
═══════════════════════════════════════════════
        TEST SUITE RESULTS
═══════════════════════════════════════════════

Frontend Tests:
  ✅ 45 passed
  ⏭️  2 skipped
  ❌ 0 failed
  Coverage: 82%

Backend Tests:
  ✅ 128 passed
  ⏭️  5 skipped
  ❌ 0 failed
  Coverage: 76%

Overall: ✅ PASSED (173 tests)
Duration: 45.3s
```
