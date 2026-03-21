# Skill: Docker Best Practices

> Multi-stage builds, layer caching, and image optimization.

## Multi-Stage Build Pattern

### Lightweight Node + Java Image

```dockerfile
# Stage 1: Build frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/src ./src
COPY frontend/vite.config.js ./
RUN npm run build

# Stage 2: Build backend
FROM maven:3.9-eclipse-temurin-17 as backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 3: Runtime (Lightweight)
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

# Copy built artifacts
COPY --from=frontend-build /app/frontend/dist /app/public
COPY --from=backend-build /app/backend/target/*.jar /app/app.jar

WORKDIR /app
USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["java", "-jar", "/app/app.jar"]
```

## Layer Caching Optimization

```dockerfile
# ✅ GOOD: Dependencies cached longer than source code
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./        # Cache this layer
RUN npm ci
COPY src ./src               # Invalidates cache only when src changes
RUN npm run build

# ❌ BAD: Source code changes invalidate dependency cache
FROM node:20-alpine
WORKDIR /app
COPY . .                     # Copies everything including src
RUN npm ci
RUN npm run build
```

## Image Size Reduction

### Use Alpine Linux

```dockerfile
# ❌ Large (1.2GB)
FROM ubuntu:latest
RUN apt-get update && apt-get install -y node npm

# ✅ Small (150MB)
FROM node:20-alpine
```

### Multi-Stage Separation

```dockerfile
# Final image only includes runtime, not build tools

# ❌ Large image (includes build tools)
FROM node:20
RUN npm install
RUN npm run build  # Included in final image
RUN npm install --only=production

# ✅ Smaller image (build tools discarded)
FROM node:20 as builder
RUN npm install
RUN npm run build

FROM node:20-alpine
COPY --from=builder /app/dist ./dist
RUN npm install --only=production
```

### Minimize Layers

```dockerfile
# ❌ Many layers (larger image)
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get clean

# ✅ Single layer (smaller image)
RUN apt-get update && \
    apt-get install -y curl git && \
    apt-get clean
```

## Non-Root User

```dockerfile
# ❌ Running as root (security risk)
FROM node:20-alpine
WORKDIR /app
COPY . .
CMD ["npm", "start"]

# ✅ Non-root user (secure)
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

WORKDIR /app
COPY --chown=nodejs:nodejs . .

USER nodejs

CMD ["npm", "start"]
```

## Health Checks

```dockerfile
# Health check for liveness
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Environment-specific health checks
HEALTHCHECK --interval=10s CMD ["node", "/app/health.js"]
```

## Environment Variables

```dockerfile
# ❌ Hardcoded (insecure)
ENV DATABASE_URL=postgresql://localhost/mydb
ENV API_KEY=secret123

# ✅ Dynamic (pass at runtime)
ENV DATABASE_URL=
ENV API_KEY=
# Use: docker run -e DATABASE_URL=... -e API_KEY=...
```

## Volume Mounts

```dockerfile
# Define volume mount point
VOLUME /app/logs

# Usage:
# docker run -v /host/logs:/app/logs myapp
```

## .dockerignore

```
node_modules
.git
.gitignore
README.md
.env
.env.local
coverage
dist
build
__pycache__
*.log
.DS_Store
.vscode
.idea
```

## Build Arguments vs Environment Variables

```dockerfile
# Build argument (available only during build)
ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

# Environment variable (available at runtime)
ENV APP_NAME=myapp
CMD ["node", "/app/app.js"]

# Usage:
# docker build --build-arg NODE_ENV=development .
# docker run -e APP_NAME=production myapp
```

## Complete Production Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine as dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine

# Install dumb-init (PID 1 handler)
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 nodejs && adduser -u 1001 -S nodejs -G nodejs

WORKDIR /app

# Copy dependencies
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built app
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health.js || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

## Docker Compose for Development

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
    environment:
      - VITE_API_URL=http://localhost:8080

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    volumes:
      - ./backend/src:/app/src
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/myapp
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=password
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Security Best Practices

1. **Don't run as root** → Use non-root user
2. **Scan images** → `docker scan myimage`
3. **Use secrets** → `docker run --secret my_secret`
4. **Read-only filesystem** → `--read-only --tmpfs /tmp`
5. **Resource limits** → `-m 512m --cpus 1`
6. **No latest tags** → Pin specific versions
7. **Small base images** → Alpine, distroless
8. **Security scanning** → Trivy, Snyk
