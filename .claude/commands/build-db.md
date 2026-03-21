# /build-db

> Orchestrates the Database Agent to design MongoDB schemas.

## Trigger
```
/build-db <collection-description>
```

## Workflow

1. **Load Database Agent**: Invokes `agents/database-agent.md`
2. **Load Skills**: mongodb-design.md
3. **Analyze Requirements**: Understand data relationships
4. **Design**:
   - Collection schema with field types
   - Embedding vs referencing strategy
   - Indexes for performance
   - Validation rules
   - Relationships/references
5. **Optimize**: Add indexes, denormalization where appropriate
6. **Review**: Trigger `/review-code` for performance check

## Examples

```
/build-db Design Users collection with authentication fields
/build-db Create Orders collection with nested items
/build-db Build Products collection with inventory tracking
/build-db Design Comments collection with parent-child relationships
```

## Output Format

```json
// Collections Design

db.users {
  _id: ObjectId,
  email: String (unique index),
  passwordHash: String,
  createdAt: Date (index),
  updatedAt: Date
}

db.orders {
  _id: ObjectId,
  userId: ObjectId (indexed, ref: users),
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      price: Decimal128
    }
  ],
  totalAmount: Decimal128,
  status: String (enum),
  createdAt: Date
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.orders.createIndex({ userId: 1, createdAt: -1 })
```

## Design Patterns

- **Embedding**: One-to-few relationships (items in orders)
- **Referencing**: One-to-many relationships (orders → products)
- **Denormalization**: Duplicate data for read performance
- **Sharding**: Partition strategy for large collections
