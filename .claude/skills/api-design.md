# Skill: REST API Design

> RESTful API design principles, versioning, and error handling.

## REST Conventions

### HTTP Methods
```
GET    /api/users           # List all users
GET    /api/users/{id}      # Get specific user
POST   /api/users           # Create new user
PUT    /api/users/{id}      # Update entire user
PATCH  /api/users/{id}      # Partial update
DELETE /api/users/{id}      # Delete user
```

### HTTP Status Codes
```
200 OK                       # Successful GET/PUT
201 Created                  # Successful POST
204 No Content               # Successful DELETE
400 Bad Request              # Invalid input
401 Unauthorized             # Missing/invalid auth
403 Forbidden                # Lacks permission
404 Not Found                # Resource doesn't exist
409 Conflict                 # Duplicate resource
422 Unprocessable Entity     # Validation error
500 Internal Server Error    # Server error
```

## Request/Response Format

### List Endpoint
```
GET /api/users?page=0&size=20&sort=createdAt:desc

Response 200:
{
  "success": true,
  "data": [
    { "id": 1, "name": "John", "email": "john@example.com" },
    { "id": 2, "name": "Jane", "email": "jane@example.com" }
  ],
  "code": 200,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Single Endpoint
```
GET /api/users/1

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John",
    "email": "john@example.com",
    "createdAt": "2024-01-10T08:00:00Z"
  },
  "code": 200,
  "timestamp": "2024-01-15T10:30:00Z"
}

Response 404:
{
  "success": false,
  "message": "User with id 999 not found",
  "code": 404,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Create Endpoint
```
POST /api/users
Content-Type: application/json

Request:
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecurePassword123"
}

Response 201:
{
  "success": true,
  "data": {
    "id": 3,
    "name": "New User",
    "email": "newuser@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "code": 201,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Update Endpoint
```
PUT /api/users/1
Content-Type: application/json

Request:
{
  "name": "Updated Name",
  "email": "updated@example.com"
}

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Name",
    "email": "updated@example.com",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "code": 200,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Delete Endpoint
```
DELETE /api/users/1

Response 204: No Content
```

## Pagination

```
GET /api/users?page=0&size=20&sort=createdAt:desc

Response:
{
  "success": true,
  "data": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  },
  "code": 200,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Filtering

```
GET /api/users?status=ACTIVE&createdAfter=2024-01-01

Response filters to active users created after Jan 1, 2024
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "code": 422,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Invalid credentials",
  "code": 401,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "code": 500,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## API Versioning

### URL-based Versioning (Recommended)
```
/api/v1/users        # Version 1
/api/v2/users        # Version 2
```

### Header-based Versioning
```
GET /api/users
X-API-Version: 1

GET /api/users
X-API-Version: 2
```

## Authentication

### Bearer Token
```
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response will include authenticated user data
```

## Rate Limiting Headers

```
X-RateLimit-Limit: 100           # Requests per window
X-RateLimit-Remaining: 99         # Requests left
X-RateLimit-Reset: 1705334800    # Unix timestamp of reset
```

## Best Practices

1. **Use meaningful resource names**: `/api/users`, not `/api/getUsers`
2. **Use HTTP methods correctly**: GET for reading, POST for creating
3. **Use consistent response format**: Same structure for all endpoints
4. **Include proper status codes**: Don't return 200 for errors
5. **Provide helpful error messages**: Guide clients to fix the issue
6. **Version your API early**: Avoid breaking changes
7. **Document all endpoints**: Include request/response examples
8. **Paginate large results**: Prevent memory issues
9. **Use filtering/sorting**: Let clients customize results
10. **Include timestamps**: Help with caching and debugging
