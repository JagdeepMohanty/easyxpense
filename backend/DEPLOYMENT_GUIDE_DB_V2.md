# Database Refactoring Deployment Guide

## Overview
This guide covers deploying database improvements including MongoDB transactions, compound indexes, and normalized categories.

---

## Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster is running (M0 or higher)
- [ ] MongoDB version 4.0+ (required for transactions)
- [ ] Backup current database
- [ ] Test migration on staging environment
- [ ] Review `DATABASE_SCHEMA_V2.md`

---

## Deployment Steps

### Step 1: Backup Database

```bash
# Using mongodump
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/EasyXpense" --out=backup_$(date +%Y%m%d)

# Or use MongoDB Atlas UI: Clusters → Backup → Create Snapshot
```

### Step 2: Install Dependencies

```bash
cd backend
pip install -r requirements.txt

# Verify motor and pymongo versions
pip show motor pymongo
```

### Step 3: Create Indexes (Zero Downtime)

```bash
# Run enhanced index setup
python setup_indexes_v2.py
```

**Expected Output**:
```
Setting up MongoDB indexes for EasyXpense v2...
============================================================

1. Users collection:
   ✓ email (unique, sparse)
   ✓ phone (unique, sparse)

2. Categories collection (NEW):
   ✓ name (unique)
   ✓ user_id

3. Friends collection:
   ✓ user_id + name

4. Expenses collection (ENHANCED):
   ✓ user_id + date (descending)
   ✓ user_id + category_id (NEW)
   ✓ group_id + created_at (NEW)
   ✓ user_id + category (legacy)
   ✓ date (descending)
   ✓ category_id (NEW)

5. Settlements collection (ENHANCED):
   ✓ user_id + created_at (NEW)
   ✓ user_id + date (legacy)

6. Debts collection (NEW):
   ✓ debtor_id + creditor_id (NEW)
   ✓ creditor_id
   ✓ expense_id
   ✓ created_at

...

✅ All indexes created successfully!
```

### Step 4: Deploy Backend Code

```bash
# Deploy updated backend with transaction support
git add .
git commit -m "feat: Add MongoDB transactions and normalized categories"
git push origin main

# Render will auto-deploy
```

**Verify deployment**:
```bash
curl https://your-backend.onrender.com/health
```

### Step 5: Run Category Migration

```bash
# Migrate existing category strings to category_id
python migrate_categories.py
```

**Expected Output**:
```
Starting category migration...
============================================================

1. Creating default system categories...
   ✓ food (created)
   ✓ transport (created)
   ✓ shopping (created)
   ✓ bills (created)
   ✓ entertainment (created)
   ✓ health (created)
   ✓ education (created)
   ✓ travel (created)
   ✓ utilities (created)
   ✓ other (created)

2. Finding unique categories in expenses...
   Found 15 unique categories

3. Creating custom categories...
   ✓ groceries (custom)
   ✓ rent (custom)
   Created 5 custom categories

4. Updating expenses with category_id...
   Processing 1234 expenses...
   ✓ Updated 1234 expenses
   ⚠ Skipped 0 expenses

5. Verification...
   Total categories: 15
   Expenses with category_id: 1234
   Migration success rate: 100.0%

============================================================
✅ Migration completed successfully!
============================================================
```

### Step 6: Verify Migration

```bash
# Check MongoDB Atlas UI or use mongo shell
mongosh "mongodb+srv://cluster.mongodb.net/EasyXpense"

# Verify categories collection
db.categories.countDocuments()
db.categories.find().pretty()

# Verify expenses have category_id
db.expenses.findOne({ category_id: { $exists: true } })

# Check index usage
db.expenses.find({ user_id: "123", category_id: ObjectId("...") }).explain("executionStats")
```

### Step 7: Test Application

**Test Cases**:
1. ✅ Create new expense → Should use transaction
2. ✅ View expenses by category → Should use category_id
3. ✅ Create expense in group → Should update group totals atomically
4. ✅ Legacy expenses → Should still display correctly
5. ✅ Debt calculations → Should use new debts collection

**API Tests**:
```bash
# Test expense creation with transaction
curl -X POST https://your-backend.onrender.com/api/v1/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "description": "Test expense",
    "category": "food",
    "friends": ["Alice", "Bob"],
    "date": "2024-01-15T10:00:00Z"
  }'

# Verify response includes category_id
```

---

## Rollback Plan

### If Migration Fails

```bash
# Rollback category migration
python migrate_categories.py --rollback

# This will:
# 1. Remove category_id from all expenses
# 2. Optionally delete categories collection
```

### If Application Breaks

```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Or use Render UI: Deployments → Rollback
```

### Restore from Backup

```bash
# Using mongorestore
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/EasyXpense" backup_20240115/EasyXpense
```

---

## Performance Monitoring

### Check Index Usage

```javascript
// MongoDB Atlas UI: Performance Advisor
// Or use explain()

db.expenses.find({ 
  user_id: "123", 
  category_id: ObjectId("...") 
}).explain("executionStats")

// Look for:
// - "stage": "IXSCAN" (index scan, good)
// - "indexName": "user_id_1_category_id_1" (compound index used)
// - "executionTimeMillis": < 10ms (fast)
```

### Monitor Query Performance

```javascript
// Enable profiling (temporarily)
db.setProfilingLevel(1, { slowms: 100 })

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(10)

// Disable profiling
db.setProfilingLevel(0)
```

---

## Post-Deployment Tasks

### Week 1: Monitor
- [ ] Check error logs for transaction failures
- [ ] Monitor query performance in Atlas
- [ ] Verify no data inconsistencies
- [ ] Check index usage statistics

### Week 2: Optimize
- [ ] Review slow query logs
- [ ] Adjust index strategy if needed
- [ ] Consider removing legacy indexes

### Month 1: Cleanup (Optional)
- [ ] Remove legacy `category` field from expenses
- [ ] Update frontend to use `category_id` exclusively
- [ ] Remove backward compatibility code

---

## Troubleshooting

### Issue: Transaction Timeout

**Symptom**: `TransactionTooLargeForCache` error

**Solution**:
```python
# Reduce batch size in transaction
# Split large operations into smaller transactions
```

### Issue: Index Not Used

**Symptom**: Queries still slow after migration

**Solution**:
```javascript
// Check index exists
db.expenses.getIndexes()

// Force index usage
db.expenses.find({ user_id: "123", category_id: ObjectId("...") })
  .hint({ user_id: 1, category_id: 1 })
```

### Issue: Category Not Found

**Symptom**: Expenses show "Unknown category"

**Solution**:
```bash
# Re-run migration for specific expenses
python migrate_categories.py
```

### Issue: Duplicate Categories

**Symptom**: Multiple categories with same name

**Solution**:
```javascript
// Find duplicates
db.categories.aggregate([
  { $group: { _id: "$name", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])

// Merge duplicates manually
```

---

## Environment Variables

Ensure these are set in production:

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/EasyXpense
JWT_SECRET_KEY=your-secret-key
FLASK_ENV=production
PORT=10000
```

---

## Success Criteria

✅ All indexes created successfully
✅ Migration success rate > 99%
✅ No transaction errors in logs
✅ Query performance improved by 5-10x
✅ Application works with both legacy and new data
✅ Zero downtime during deployment

---

## Support

**Issues**: Check logs in Render dashboard
**Database**: MongoDB Atlas monitoring
**Documentation**: `DATABASE_SCHEMA_V2.md`

---

**Version**: 2.0
**Last Updated**: 2024
