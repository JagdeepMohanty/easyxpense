# Database v2 Deployment Checklist

## Pre-Deployment

### Preparation
- [ ] Review `README_DB_V2.md` for overview
- [ ] Review `DATABASE_SCHEMA_V2.md` for schema changes
- [ ] Review `DEPLOYMENT_GUIDE_DB_V2.md` for detailed steps
- [ ] Verify MongoDB version is 4.0+ (required for transactions)
- [ ] Verify MongoDB Atlas cluster is running
- [ ] Confirm backup strategy is in place

### Backup
- [ ] Create MongoDB Atlas snapshot
- [ ] Or run: `mongodump --uri="..." --out=backup_$(date +%Y%m%d)`
- [ ] Verify backup completed successfully
- [ ] Store backup location: `_______________________`

### Environment Check
- [ ] Verify `MONGO_URI` is set in production
- [ ] Verify `JWT_SECRET_KEY` is set
- [ ] Verify `FLASK_ENV=production`
- [ ] Check MongoDB Atlas network access (0.0.0.0/0)
- [ ] Check MongoDB Atlas user permissions (read/write)

---

## Deployment Phase 1: Setup Indexes

### Run Index Setup Script
- [ ] Navigate to backend directory: `cd backend`
- [ ] Activate virtual environment
- [ ] Run: `python setup_indexes_v2.py`
- [ ] Verify output shows "✅ All indexes created successfully!"
- [ ] Check index summary in output

### Verify Indexes Created
- [ ] Open MongoDB Atlas UI → Collections → Indexes
- [ ] Verify `categories` collection has 2 indexes
- [ ] Verify `expenses` collection has 6 indexes
- [ ] Verify `debts` collection has 4 indexes
- [ ] Verify `settlements` collection has 2 indexes

**Time Estimate**: 5 minutes  
**Risk Level**: Low (non-breaking)  
**Rollback**: Not needed (indexes don't break existing queries)

---

## Deployment Phase 2: Deploy Backend Code

### Code Deployment
- [ ] Review changes: `git diff`
- [ ] Stage files: `git add .`
- [ ] Commit: `git commit -m "feat: Database v2 with transactions and normalized categories"`
- [ ] Push: `git push origin main`
- [ ] Monitor Render deployment logs
- [ ] Wait for deployment to complete

### Verify Deployment
- [ ] Check health endpoint: `curl https://your-backend.onrender.com/health`
- [ ] Verify response: `{"status": "healthy"}`
- [ ] Check Render logs for errors
- [ ] Test existing API endpoints (should work unchanged)

**Time Estimate**: 10 minutes  
**Risk Level**: Low (backward compatible)  
**Rollback**: `git revert HEAD && git push`

---

## Deployment Phase 3: Migrate Data

### Run Migration Script
- [ ] Navigate to backend directory: `cd backend`
- [ ] Run: `python migrate_categories.py`
- [ ] Monitor output for errors
- [ ] Verify "✅ Migration completed successfully!"
- [ ] Check migration success rate (should be 100%)

### Verify Migration Results
- [ ] Check categories created: `db.categories.countDocuments()`
- [ ] Expected: 10+ categories (10 system + custom)
- [ ] Check expenses updated: `db.expenses.countDocuments({ category_id: { $exists: true } })`
- [ ] Expected: All expenses have category_id
- [ ] Verify legacy category field still exists

### Migration Output Checklist
- [ ] System categories created: 10
- [ ] Custom categories created: _____
- [ ] Total categories: _____
- [ ] Expenses updated: _____
- [ ] Expenses skipped: 0 (or minimal)
- [ ] Migration success rate: ____%

**Time Estimate**: 10 minutes  
**Risk Level**: Low (backward compatible, keeps legacy fields)  
**Rollback**: `python migrate_categories.py --rollback`

---

## Deployment Phase 4: Verification

### Functional Testing
- [ ] Test: Create new expense via API
- [ ] Verify: Expense has both `category` and `category_id`
- [ ] Test: Query expenses by category
- [ ] Verify: Results returned correctly
- [ ] Test: Create expense in group
- [ ] Verify: Group totals updated
- [ ] Test: Legacy expenses still display
- [ ] Verify: No errors in frontend

### Performance Testing
- [ ] Run query: `db.expenses.find({ user_id: "...", category_id: ObjectId("...") }).explain("executionStats")`
- [ ] Verify: `"stage": "IXSCAN"` (index scan, not COLLSCAN)
- [ ] Verify: `"indexName": "user_id_1_category_id_1"`
- [ ] Verify: `"executionTimeMillis"` < 10ms
- [ ] Check MongoDB Atlas Performance Advisor
- [ ] Verify: No slow query warnings

### Data Consistency Testing
- [ ] Create expense with transaction
- [ ] Verify: Expense created
- [ ] Verify: Debts created
- [ ] Verify: Group totals updated (if applicable)
- [ ] Simulate transaction failure (invalid data)
- [ ] Verify: All changes rolled back
- [ ] Verify: No partial data in database

### API Endpoint Testing
```bash
# Test expense creation
- [ ] POST /api/v1/expenses
- [ ] GET /api/v1/expenses
- [ ] GET /api/v1/expenses?category=food
- [ ] GET /api/v1/analytics/categories
- [ ] GET /api/v1/groups/:id/expenses
```

**Time Estimate**: 15 minutes  
**Risk Level**: None (testing only)

---

## Post-Deployment Monitoring

### Week 1: Active Monitoring
- [ ] Day 1: Check error logs every 2 hours
- [ ] Day 2: Check error logs every 4 hours
- [ ] Day 3-7: Check error logs daily
- [ ] Monitor MongoDB Atlas performance metrics
- [ ] Monitor Render application metrics
- [ ] Check for transaction timeout errors
- [ ] Check for index usage in slow query logs

### Metrics to Track
- [ ] Average query response time: _____ ms
- [ ] Transaction success rate: _____%
- [ ] Transaction failure rate: _____%
- [ ] Index hit rate: _____%
- [ ] Database CPU usage: _____%
- [ ] Database memory usage: _____%

### Issues to Watch For
- [ ] Transaction timeout errors
- [ ] Index not being used (COLLSCAN in explain)
- [ ] Category not found errors
- [ ] Duplicate category errors
- [ ] Data inconsistency reports
- [ ] Performance degradation

**Time Estimate**: 1 hour/day for 7 days  
**Risk Level**: None (monitoring only)

---

## Week 2: Optimization

### Performance Review
- [ ] Review MongoDB Atlas Performance Advisor
- [ ] Check slow query logs
- [ ] Verify all queries use indexes
- [ ] Check index size and memory usage
- [ ] Review transaction execution times

### Optimization Tasks
- [ ] Adjust index strategy if needed
- [ ] Optimize slow queries
- [ ] Consider removing unused indexes
- [ ] Review transaction batch sizes

**Time Estimate**: 2 hours  
**Risk Level**: Low

---

## Month 1: Cleanup (Optional)

### Legacy Field Removal
- [ ] Verify all frontend code uses `category_id`
- [ ] Update API responses to exclude `category` field
- [ ] Remove `category` field from expense schema
- [ ] Remove legacy `user_id + category` index
- [ ] Test thoroughly after removal

### Documentation Updates
- [ ] Update API documentation
- [ ] Update frontend documentation
- [ ] Update database schema docs
- [ ] Archive migration scripts

**Time Estimate**: 4 hours  
**Risk Level**: Medium (breaking change if not careful)  
**Recommendation**: Wait 1 month before cleanup

---

## Rollback Procedures

### If Migration Fails
```bash
- [ ] Run: python migrate_categories.py --rollback
- [ ] Verify: category_id removed from expenses
- [ ] Verify: Application still works
- [ ] Investigate: Check migration logs for errors
```

### If Application Breaks
```bash
- [ ] Revert deployment: git revert HEAD && git push
- [ ] Monitor: Render auto-deploys previous version
- [ ] Verify: Application works again
- [ ] Investigate: Check error logs
```

### If Data Corruption
```bash
- [ ] Stop application: Disable in Render
- [ ] Restore backup: mongorestore --uri="..." backup_YYYYMMDD/
- [ ] Verify: Data restored correctly
- [ ] Restart application: Enable in Render
- [ ] Investigate: Root cause analysis
```

---

## Success Criteria

### Must Have (Required)
- [x] All indexes created successfully
- [ ] Migration success rate > 99%
- [ ] Zero transaction errors in first 24 hours
- [ ] All API endpoints working
- [ ] No data loss or corruption
- [ ] Application performance maintained or improved

### Should Have (Desired)
- [ ] Query performance improved by 5x+
- [ ] Transaction success rate > 99.9%
- [ ] Index usage > 95%
- [ ] Zero slow query warnings
- [ ] User-reported issues: 0

### Nice to Have (Bonus)
- [ ] Query performance improved by 10x+
- [ ] Transaction success rate 100%
- [ ] Index usage 100%
- [ ] Database CPU usage reduced
- [ ] User satisfaction increased

---

## Sign-Off

### Deployment Team
- [ ] Backend Developer: _________________ Date: _______
- [ ] DevOps Engineer: __________________ Date: _______
- [ ] QA Engineer: _____________________ Date: _______

### Verification
- [ ] All tests passed
- [ ] No critical errors
- [ ] Performance metrics acceptable
- [ ] Rollback plan tested
- [ ] Documentation complete

### Approval
- [ ] Technical Lead: ___________________ Date: _______
- [ ] Product Owner: ___________________ Date: _______

---

## Notes

### Deployment Date: _______________________
### Deployment Time: _______________________
### Deployed By: ___________________________
### MongoDB Version: _______________________
### Backend Version: _______________________

### Issues Encountered:
```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

### Resolutions:
```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

### Lessons Learned:
```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

## Quick Reference

### Useful Commands
```bash
# Check indexes
db.expenses.getIndexes()

# Check migration status
db.expenses.countDocuments({ category_id: { $exists: true } })

# Check query performance
db.expenses.find({ user_id: "...", category_id: ObjectId("...") }).explain("executionStats")

# Check transaction logs
grep "Transaction" /var/log/app.log

# Rollback migration
python migrate_categories.py --rollback

# Restore backup
mongorestore --uri="..." backup_YYYYMMDD/
```

### Useful Links
- MongoDB Atlas: https://cloud.mongodb.com
- Render Dashboard: https://dashboard.render.com
- Application: https://easyxpense.netlify.app
- API: https://easyxpense.onrender.com

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Failed

**Overall Progress**: _____ / _____ tasks complete (____%)

**Estimated Total Time**: 45 minutes  
**Actual Total Time**: _____ minutes

**Deployment Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Failed
