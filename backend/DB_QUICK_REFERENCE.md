# Database v2 Quick Reference

## 🚀 Quick Start

### Create Expense with Transaction

```python
from app.services.expense_transaction_service import create_expense_with_transaction

# Sync version
expense_id = create_expense_with_transaction(
    user_id="user123",
    amount=100.00,
    description="Dinner with friends",
    category="food",  # Will be converted to category_id
    friends=["Alice", "Bob"],
    date="2024-01-15T19:00:00Z",
    group_id="group456"  # Optional
)

# Async version
from app.services.expense_transaction_service import async_create_expense_with_transaction

expense_id = await async_create_expense_with_transaction(
    user_id="user123",
    amount=100.00,
    description="Dinner with friends",
    category="food",
    friends=["Alice", "Bob"]
)
```

### Query with Compound Indexes

```python
from app.extensions import db
from bson import ObjectId

# ✅ Fast: Uses user_id + category_id compound index
expenses = db.expenses.find({
    'user_id': 'user123',
    'category_id': ObjectId('...')
}).sort('date', -1)

# ✅ Fast: Uses group_id + created_at compound index
group_expenses = db.expenses.find({
    'group_id': ObjectId('...')
}).sort('created_at', -1)

# ✅ Fast: Uses debtor_id + creditor_id compound index
debts = db.debts.find({
    'debtor_id': 'user1',
    'creditor_id': 'user2'
})
```

### Work with Categories

```python
from app.repositories.category_repository import CategoryRepository
from app.models.category_model import Category

# Find or create category
category = CategoryRepository.find_or_create('food')
category_id = category['_id']

# Get all system categories
categories = CategoryRepository.find_all_system_categories()

# Async version
category = await CategoryRepository.async_find_or_create('food')
```

---

## 📋 Common Patterns

### Pattern 1: Transaction-Safe Multi-Step Operation

```python
from app.extensions import mongo_client, db

with mongo_client.start_session() as session:
    with session.start_transaction():
        try:
            # Step 1: Insert document
            result = db.collection1.insert_one(doc1, session=session)
            
            # Step 2: Update related document
            db.collection2.update_one(
                {'_id': related_id},
                {'$inc': {'count': 1}},
                session=session
            )
            
            # Step 3: Insert another document
            db.collection3.insert_one(doc3, session=session)
            
            # Commit
            session.commit_transaction()
            
        except Exception as e:
            # Automatic rollback
            session.abort_transaction()
            raise
```

### Pattern 2: Efficient Category Lookup

```python
# ✅ Good: Single query with compound index
expenses = db.expenses.find({
    'user_id': user_id,
    'category_id': category_id
})

# ❌ Bad: Two separate queries
expenses = db.expenses.find({'user_id': user_id})
expenses = [e for e in expenses if e['category_id'] == category_id]
```

### Pattern 3: Backward Compatible Queries

```python
# Support both legacy and new format
def get_expense_category(expense):
    # Try new format first
    if 'category_id' in expense:
        category = db.categories.find_one({'_id': expense['category_id']})
        return category['name'] if category else 'Unknown'
    
    # Fall back to legacy format
    return expense.get('category', 'Unknown')
```

---

## 🔍 Index Usage Verification

```python
# Check if query uses index
result = db.expenses.find({
    'user_id': 'user123',
    'category_id': ObjectId('...')
}).explain('executionStats')

# Look for:
print(result['executionStats']['executionTimeMillis'])  # Should be < 10ms
print(result['executionStats']['stage'])  # Should be 'IXSCAN'
print(result['executionStats']['indexName'])  # Should be 'user_id_1_category_id_1'
```

---

## 🛠️ Debugging

### Check Transaction Status

```python
from app.utils.logger import log_info, log_error

with mongo_client.start_session() as session:
    with session.start_transaction():
        try:
            log_info("Transaction started")
            
            # Your operations here
            
            session.commit_transaction()
            log_info("Transaction committed")
            
        except Exception as e:
            log_error(f"Transaction failed: {e}")
            session.abort_transaction()
            raise
```

### Verify Index Usage

```bash
# MongoDB shell
db.expenses.find({ user_id: "123", category_id: ObjectId("...") }).explain("executionStats")

# Look for:
# - "stage": "IXSCAN" (good)
# - "stage": "COLLSCAN" (bad - full collection scan)
```

---

## 📊 Performance Tips

### 1. Use Compound Indexes Correctly

```python
# ✅ Good: Matches index order (user_id, category_id)
db.expenses.find({'user_id': '123', 'category_id': ObjectId('...')})

# ⚠️ Suboptimal: Reversed order
db.expenses.find({'category_id': ObjectId('...'), 'user_id': '123'})
```

### 2. Limit Transaction Size

```python
# ✅ Good: Small transaction
with session.start_transaction():
    db.expenses.insert_one(expense, session=session)
    db.debts.insert_many(debts[:10], session=session)
    session.commit_transaction()

# ❌ Bad: Large transaction (may timeout)
with session.start_transaction():
    db.expenses.insert_many(expenses[:1000], session=session)
    session.commit_transaction()
```

### 3. Use Projections

```python
# ✅ Good: Only fetch needed fields
expenses = db.expenses.find(
    {'user_id': '123'},
    {'description': 1, 'amount': 1, 'date': 1}
)

# ❌ Bad: Fetch all fields
expenses = db.expenses.find({'user_id': '123'})
```

---

## 🔧 Common Issues

### Issue: Transaction Timeout

**Error**: `TransactionTooLargeForCache`

**Solution**:
```python
# Split into smaller transactions
for batch in chunks(items, 100):
    with session.start_transaction():
        db.collection.insert_many(batch, session=session)
        session.commit_transaction()
```

### Issue: Index Not Used

**Error**: Slow queries despite indexes

**Solution**:
```python
# Force index usage
db.expenses.find({
    'user_id': '123',
    'category_id': ObjectId('...')
}).hint({'user_id': 1, 'category_id': 1})
```

### Issue: Category Not Found

**Error**: `None` returned for category

**Solution**:
```python
# Use find_or_create instead of find
category = CategoryRepository.find_or_create('food')
# This will create if not exists
```

---

## 📚 API Examples

### Create Expense (Route)

```python
from flask import Blueprint, request
from app.services.expense_transaction_service import create_expense_with_transaction
from app.utils.api_response import success_response, error_response

@expenses_bp.route('/expenses', methods=['POST'])
def create_expense():
    try:
        data = request.json
        expense_id = create_expense_with_transaction(
            user_id=request.user_id,
            amount=data['amount'],
            description=data['description'],
            category=data['category'],
            friends=data.get('friends', []),
            date=data.get('date'),
            group_id=data.get('group_id')
        )
        return success_response({'expense_id': expense_id}, 'Expense created')
    except Exception as e:
        return error_response(str(e), 400)
```

### Get Expenses by Category (Route)

```python
@expenses_bp.route('/expenses/category/<category_name>', methods=['GET'])
def get_expenses_by_category(category_name):
    try:
        # Find category
        category = CategoryRepository.find_by_name(category_name)
        if not category:
            return error_response('Category not found', 404)
        
        # Query with compound index
        expenses = db.expenses.find({
            'user_id': request.user_id,
            'category_id': category['_id']
        }).sort('date', -1).limit(50)
        
        return success_response({
            'expenses': [Expense.to_dict(e) for e in expenses]
        })
    except Exception as e:
        return error_response(str(e), 500)
```

---

## 🎯 Best Practices

1. **Always use transactions for multi-step operations**
2. **Leverage compound indexes for common queries**
3. **Use category_id for new code, support category for legacy**
4. **Monitor index usage with explain()**
5. **Keep transactions small and fast**
6. **Use async versions for better performance**
7. **Log transaction start/commit/rollback**
8. **Handle transaction errors gracefully**

---

## 📖 Further Reading

- `DATABASE_SCHEMA_V2.md` - Complete schema documentation
- `DEPLOYMENT_GUIDE_DB_V2.md` - Deployment instructions
- `DB_REFACTORING_SUMMARY.md` - Refactoring overview

---

**Quick Links**:
- Transaction Service: `app/services/expense_transaction_service.py`
- Category Repository: `app/repositories/category_repository.py`
- Index Setup: `setup_indexes_v2.py`
- Migration: `migrate_categories.py`
