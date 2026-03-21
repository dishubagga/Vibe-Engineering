# Skill: MongoDB Schema Design

> MongoDB schema design patterns, indexing, and relationships.

## Schema Design Principles

### 1. Embedding vs Referencing

**Embed when:**
- One-to-few relationships
- Data is frequently accessed together
- Data doesn't change often independently

**Reference when:**
- One-to-many relationships
- Data changes independently
- Duplication would be expensive

### 2. Embedded Design Example

```javascript
// orders collection with embedded items
db.orders.insertOne({
  _id: ObjectId("..."),
  customerId: ObjectId("..."),
  items: [
    {
      productId: ObjectId("..."),
      quantity: 2,
      price: 19.99,
      subtotal: 39.98
    },
    {
      productId: ObjectId("..."),
      quantity: 1,
      price: 49.99,
      subtotal: 49.99
    }
  ],
  totalAmount: 89.97,
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### 3. Referenced Design Example

```javascript
// users collection
db.users.insertOne({
  _id: ObjectId("..."),
  email: "john@example.com",
  name: "John Doe",
  createdAt: new Date()
});

// orders collection with references
db.orders.insertOne({
  _id: ObjectId("..."),
  customerId: ObjectId("..."),  // Reference to user
  itemIds: [
    ObjectId("..."),  // References to items
    ObjectId("...")
  ],
  totalAmount: 89.97,
  status: "pending",
  createdAt: new Date()
});
```

## Collection Schemas

### Users Collection

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "passwordHash"],
      properties: {
        _id: { bsonType: "objectId" },
        email: {
          bsonType: "string",
          minLength: 5,
          maxLength: 255,
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        passwordHash: { bsonType: "string", minLength: 60 },
        name: { bsonType: "string", minLength: 1, maxLength: 100 },
        phone: { bsonType: "string", minLength: 10, maxLength: 20 },
        status: {
          enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
          default: "ACTIVE"
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ status: 1 });
```

### Products Collection

```javascript
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price", "inventory"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string", minLength: 1 },
        description: { bsonType: "string" },
        price: { bsonType: "decimal", minimum: 0 },
        inventory: { bsonType: "int", minimum: 0 },
        category: { bsonType: "string" },
        ratings: {
          bsonType: "object",
          properties: {
            average: { bsonType: "double" },
            count: { bsonType: "int" },
            reviews: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  userId: { bsonType: "objectId" },
                  rating: { bsonType: "int", minimum: 1, maximum: 5 },
                  comment: { bsonType: "string" },
                  createdAt: { bsonType: "date" }
                }
              }
            }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ category: 1, price: 1 });
db.products.createIndex({ "ratings.average": -1 });
db.products.createIndex({ inventory: 1 });
```

### Orders Collection

```javascript
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["customerId", "items", "totalAmount"],
      properties: {
        _id: { bsonType: "objectId" },
        customerId: { bsonType: "objectId" },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["productId", "quantity", "price"],
            properties: {
              productId: { bsonType: "objectId" },
              quantity: { bsonType: "int", minimum: 1 },
              price: { bsonType: "decimal", minimum: 0 },
              subtotal: { bsonType: "decimal", minimum: 0 }
            }
          }
        },
        totalAmount: { bsonType: "decimal", minimum: 0 },
        status: {
          enum: ["pending", "processing", "shipped", "delivered", "cancelled"]
        },
        shippingAddress: {
          bsonType: "object",
          properties: {
            street: { bsonType: "string" },
            city: { bsonType: "string" },
            state: { bsonType: "string" },
            zipCode: { bsonType: "string" },
            country: { bsonType: "string" }
          }
        },
        paymentMethod: { enum: ["credit_card", "paypal", "bank_transfer"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        shippedAt: { bsonType: "date" },
        deliveredAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.orders.createIndex({ customerId: 1, createdAt: -1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });
db.orders.createIndex({ "items.productId": 1 });
```

## Indexing Strategy

### Index Types

```javascript
// Single field index
db.users.createIndex({ email: 1 });

// Compound index (order matters!)
db.orders.createIndex({ customerId: 1, createdAt: -1 });

// Text index (full-text search)
db.products.createIndex({ name: "text", description: "text" });

// Unique index
db.users.createIndex({ email: 1 }, { unique: true });

// TTL index (auto-delete after 24 hours)
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Sparse index (only indexes documents with the field)
db.users.createIndex({ phone: 1 }, { sparse: true });
```

### Index Query Analysis

```javascript
// Explain query plan
db.users.find({ email: "john@example.com" }).explain("executionStats");

// Should show:
// - "executionStages": "COLLSCAN" (bad - no index)
// - "executionStages": "IXSCAN" (good - using index)
// - "nReturned": X (documents returned)
// - "totalDocsExamined": Y (documents scanned)
// Ideally nReturned === totalDocsExamined
```

## Common Patterns

### Denormalization for Performance

```javascript
// BAD: Need to join to get user name with each order
db.orders.find({})
  .lookup from users...

// GOOD: Store user info in order for fast reads
db.orders.insertOne({
  _id: ObjectId(),
  customerId: ObjectId("..."),
  customerName: "John Doe",     // Denormalized
  customerEmail: "john@example.com",
  items: [...],
  totalAmount: 89.97
});
```

### One-to-Many with Arrays

```javascript
// Store arrays up to 16MB per document
db.users.insertOne({
  _id: ObjectId(),
  email: "john@example.com",
  addresses: [
    {
      type: "home",
      street: "123 Main St",
      city: "New York"
    },
    {
      type: "work",
      street: "456 Work Ave",
      city: "New York"
    }
  ]
});
```

### Pagination

```javascript
// Skip/Limit pattern
db.users
  .find({ status: "ACTIVE" })
  .skip(20)          // Skip first 20
  .limit(10)         // Get next 10
  .sort({ createdAt: -1 });

// Better: Use range query (keyset pagination)
db.users
  .find({
    status: "ACTIVE",
    _id: { $gt: lastSeenId }  // Cursor-based
  })
  .limit(10)
  .sort({ _id: 1 });
```

## Best Practices

1. **Keep documents < 16MB** (hard limit)
2. **Index queries before going to production**
3. **Avoid unbounded arrays** (can grow infinitely)
4. **Normalize for data consistency** (when updates are frequent)
5. **Denormalize for read performance** (when reads are frequent)
6. **Use TTL for temporary data** (sessions, OTP codes)
7. **Validate schema** (use JSON Schema validators)
8. **Plan indexes early** (don't add them after data grows)
9. **Monitor slow queries** (use profiler)
10. **Document schema decisions** (why embed vs reference?)
