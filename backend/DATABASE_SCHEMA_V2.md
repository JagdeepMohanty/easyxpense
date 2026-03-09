# EasyXpense Database Schema v2

## Overview
MongoDB database with normalized categories, compound indexes, and transaction support.

**Database Name**: `EasyXpense`

---

## Collections

### 1. users
User accounts and authentication

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,           // Unique, indexed
  phone: String,           // Unique, indexed, optional
  password: String,        // bcrypt hashed
  created_at: DateTime,
  updated_at: DateTime
}
```

**Indexes**:
- `email` (unique, sparse)
- `phone` (unique, sparse)

---

### 2. categories (NEW)
Normalized category storage

```javascript
{
  _id: ObjectId,
  name: String,            // Unique, lowercase, indexed
  user_id: ObjectId | null, // null = system category
  created_at: DateTime
}
```

**Indexes**:
- `name` (unique)
- `user_id`

**System Categories**:
- food
- transport
- shopping
- bills
- entertainment
- health
- education
- travel
- utilities
- other

---

### 3. expenses (ENHANCED)
Expense records with category normalization

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,       // Indexed
  amount: Number,
  description: String,
  category: String,        // LEGACY - kept for backward compatibility
  category_id: ObjectId,   // NEW - references categories._id
  friends: [String],       // Friend names
  participants: [String],  // Optional - participant IDs
  date: DateTime,
  group_id: ObjectId,      // Optional - references groups._id
  created_at: DateTime,
  migrated_at: DateTime    // Optional - migration timestamp
}
```

**Indexes**:
- `user_id + date` (compound, descending)
- `user_id + category_id` (compound) - NEW
- `group_id + created_at` (compound, descending) - NEW
- `user_id + category` (compound, legacy)
- `date` (descending)
- `category_id` - NEW

---

### 4. debts (NEW)
Debt tracking between users

```javascript
{
  _id: ObjectId,
  debtor_id: String,       // User who owes
  creditor_id: String,     // User who is owed
  amount: Number,
  expense_id: ObjectId,    // References expenses._id
  created_at: DateTime
}
```

**Indexes**:
- `debtor_id + creditor_id` (compound) - NEW
- `creditor_id`
- `expense_id`
- `created_at` (descending)

---

### 5. settlements (ENHANCED)
Payment records

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,       // Indexed
  from_user: String,
  to_user: String,
  amount: Number,
  date: DateTime,
  created_at: DateTime,
  notes: String            // Optional
}
```

**Indexes**:
- `user_id + created_at` (compound, descending) - NEW
- `user_id + date` (compound, descending, legacy)

---

### 6. friends
User's friend list

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,       // Indexed
  name: String,
  phone: String,           // Optional
  email: String,           // Optional
  created_at: DateTime
}
```

**Indexes**:
- `user_id + name` (compound)

---

### 7. groups
Expense groups

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,       // Group owner
  name: String,
  group_code: String,      // Unique, 6-char code
  members: [String],       // Member names
  total_expenses: Number,  // Updated via transactions
  created_at: DateTime,
  updated_at: DateTime
}
```

**Indexes**:
- `user_id + created_at` (compound, descending)
- `group_code` (unique)

---

### 8. group_transactions
Group expense transactions

```javascript
{
  _id: ObjectId,
  group_id: ObjectId,      // Indexed
  user_id: ObjectId,       // Indexed
  paid_by: String,         // Indexed
  amount: Number,
  description: String,
  category: String,
  split_among: [String],
  created_at: DateTime
}
```

**Indexes**:
- `group_id + created_at` (compound, descending)
- `user_id`
- `paid_by`

---

### 9. refresh_tokens
JWT refresh tokens

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,       // Indexed
  token: String,           // Unique, indexed
  expires_at: DateTime,    // TTL index
  created_at: DateTime
}
```

**Indexes**:
- `user_id`
- `token` (unique)
- `expires_at` (TTL, expireAfterSeconds=0)

---

## Transaction Support

### Expense Creation Transaction

**Operations** (atomic):
1. Find or create category → `categories`
2. Insert expense with `category_id` → `expenses`
3. Calculate splits
4. Insert debts → `debts`
5. Update group totals → `groups` (if group_id provided)

**Rollback**: If any step fails, all changes are reverted

**Implementation**:
```python
with mongo_client.start_session() as session:
    with session.start_transaction():
        # All operations here
        session.commit_transaction()
```

---

## Query Performance

### Compound Index Benefits

**Before** (single indexes):
```javascript
// Query: Get user expenses by category
db.expenses.find({ user_id: "123", category: "food" })
// Uses: user_id index → then filters category (slow)
```

**After** (compound indexes):
```javascript
// Query: Get user expenses by category_id
db.expenses.find({ user_id: "123", category_id: ObjectId("...") })
// Uses: user_id + category_id compound index (fast)
```

### Index Usage Examples

1. **User expenses by date**:
   - Index: `user_id + date`
   - Query: `db.expenses.find({ user_id: "123" }).sort({ date: -1 })`

2. **User expenses by category**:
   - Index: `user_id + category_id`
   - Query: `db.expenses.find({ user_id: "123", category_id: ObjectId("...") })`

3. **Group expenses**:
   - Index: `group_id + created_at`
   - Query: `db.groups.find({ group_id: ObjectId("...") }).sort({ created_at: -1 })`

4. **Debt lookup**:
   - Index: `debtor_id + creditor_id`
   - Query: `db.debts.find({ debtor_id: "user1", creditor_id: "user2" })`

---

## Migration Strategy

### Phase 1: Setup (Zero Downtime)
1. Run `setup_indexes_v2.py` to create new indexes
2. Deploy updated backend code with dual support (category + category_id)
3. Verify application works with existing data

### Phase 2: Migration (Low Risk)
1. Run `migrate_categories.py` to convert data
2. Creates default system categories
3. Adds `category_id` to all expenses
4. Keeps `category` field for backward compatibility

### Phase 3: Verification
1. Check migration success rate
2. Verify queries use new indexes
3. Monitor performance improvements

### Phase 4: Cleanup (Optional)
1. Remove legacy `category` field from expenses
2. Update frontend to use `category_id`
3. Remove legacy indexes

### Rollback Plan
```bash
python migrate_categories.py --rollback
```

---

## Data Consistency Guarantees

### With Transactions
✅ Expense + Debts + Group totals are always consistent
✅ No partial updates if any operation fails
✅ ACID compliance for multi-document operations

### Without Transactions (Legacy)
⚠️ Possible inconsistencies if operations fail mid-way
⚠️ Manual cleanup required for failed operations

---

## Performance Metrics

### Expected Improvements

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| User expenses by category | 50ms | 5ms | 10x faster |
| Group expense queries | 100ms | 10ms | 10x faster |
| Debt calculations | 200ms | 20ms | 10x faster |
| Category filtering | 80ms | 8ms | 10x faster |

### Index Size Estimates

- **users**: ~1KB per user
- **categories**: ~100 bytes per category
- **expenses**: ~2KB per expense (with indexes)
- **debts**: ~500 bytes per debt
- **Total overhead**: ~5-10% of data size

---

## Best Practices

### 1. Always Use Transactions for Multi-Step Operations
```python
# ✅ Good
create_expense_with_transaction(...)

# ❌ Bad
create_expense(...)
update_debts(...)
update_group_totals(...)
```

### 2. Use category_id for New Code
```python
# ✅ Good
expense = { 'category_id': ObjectId(...) }

# ⚠️ Legacy (backward compatibility only)
expense = { 'category': 'food' }
```

### 3. Leverage Compound Indexes
```python
# ✅ Good - uses compound index
db.expenses.find({ 'user_id': '123', 'category_id': ObjectId(...) })

# ❌ Bad - doesn't use compound index efficiently
db.expenses.find({ 'category_id': ObjectId(...), 'user_id': '123' })
```

### 4. Monitor Index Usage
```javascript
// Check index usage
db.expenses.find({ user_id: "123", category_id: ObjectId("...") }).explain("executionStats")
```

---

## Security Considerations

- All queries filtered by `user_id` for data isolation
- Unique constraints on email, phone, group_code
- TTL index on refresh_tokens for automatic cleanup
- Transaction rollback prevents partial data corruption

---

**Version**: 2.0
**Last Updated**: 2024
**Status**: Production Ready ✅
