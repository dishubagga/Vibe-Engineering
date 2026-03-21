# /build-backend

> Orchestrates the Backend Agent to build Spring Boot services.

## Trigger
```
/build-backend <task-description>
```

## Workflow

1. **Load Backend Agent**: Invokes `agents/backend-agent.md`
2. **Load Skills**: spring-boot-patterns.md, api-design.md
3. **Analyze Project**: Examine src/main/java, pom.xml structure
4. **Implement**:
   - REST controllers with validation
   - Service layer with business logic
   - Repository with custom queries
   - DTOs for request/response
   - Exception handling
5. **Test**: Run ./mvnw test locally
6. **Review**: Trigger `/review-code` for quality check

## Examples

```
/build-backend Create User REST endpoint with CRUD operations
/build-backend Build AuthenticationService with JWT tokens
/build-backend Create OrderRepository with pagination and filtering
/build-backend Build PaymentService with transaction management
```

## Constraints

- **Java**: 17 LTS or 21 LTS
- **Spring Boot**: 3.2.0
- **Package Structure**: `com.example.domain.{controller,service,repository,entity,dto}`
- **Controllers**: @RestController, return ApiResponse<T>
- **Services**: @Service, @Transactional, business logic
- **Repositories**: Extend JpaRepository, custom queries
- **Error Handling**: Use @ControllerAdvice for global exceptions
- **Logging**: SLF4J with @Slf4j
- **Validation**: Jakarta validation annotations

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Runtime | Java | 17 LTS / 21 LTS |
| Framework | Spring Boot | 3.2.0 |
| Data | JPA/Hibernate | Included |
| Build | Maven | 3.9.x |
| Testing | JUnit 5 + Mockito | Included |
| Security | Spring Security | 6.x |
