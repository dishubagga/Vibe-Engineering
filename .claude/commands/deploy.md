# /deploy

> Orchestrates the DevOps Agent to prepare and deploy the application.

## Trigger
```
/deploy [environment]
```

## Workflow

1. **Load DevOps Agent**: Invokes `agents/devops-agent.md`
2. **Pre-Deploy Checks**:
   - Run `/run-tests all --coverage`
   - Run `/review-code` on recent changes
   - Run security checks
   - Verify version locks
3. **Build Phase**:
   - Build frontend: `npm run build` → dist/
   - Build backend: `./mvnw clean package` → jar
4. **Containerize**:
   - Generate Dockerfile (multi-stage)
   - Build Docker image
   - Tag with version
5. **Deploy**:
   - Push image to registry
   - Update CI/CD pipeline (GitHub Actions)
   - Configure environment variables
6. **Verify**: Health checks and smoke tests

## Environments

| Environment | Description |
|------------|-------------|
| `dev` | Local development (default) |
| `staging` | Pre-production testing |
| `production` | Live deployment |

## Examples

```
/deploy
/deploy staging
/deploy production
```

## Checklist

Before deployment, verifies:
- ✅ All tests passing (70%+ coverage)
- ✅ No security vulnerabilities
- ✅ All code reviewed
- ✅ Docker image builds
- ✅ CI/CD pipeline configured
- ✅ Environment variables set
- ✅ Database migrations ready
- ✅ Monitoring configured

## Output Generated

### 1. Dockerfile
```dockerfile
# Multi-stage build

# Stage 1: Frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/src ./src
RUN npm run build

# Stage 2: Backend
FROM maven:3.9-eclipse-temurin-17 as backend-builder
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine
COPY --from=frontend-builder /app/frontend/dist /app/public
COPY --from=backend-builder /app/backend/target/*.jar /app/app.jar
EXPOSE 8080
CMD ["java", "-jar", "/app/app.jar"]
```

### 2. GitHub Actions Workflow
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: /run-tests all --coverage
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Push to registry
        run: docker push myapp:${{ github.sha }}
      - name: Deploy
        run: kubectl set image deployment/myapp myapp=myapp:${{ github.sha }}
```

### 3. Environment Configuration
```env
# .env.production
VITE_API_URL=https://api.example.com
SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/myapp
SPRING_DATASOURCE_USERNAME=${DB_USER}
SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
```
