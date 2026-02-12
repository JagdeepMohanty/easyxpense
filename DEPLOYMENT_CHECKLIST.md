# EasyXpense Production Deployment Checklist

## Pre-Deployment

### Backend (Render)
- [ ] Set FLASK_ENV=production
- [ ] Set JWT_SECRET_KEY (generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- [ ] Set MONGO_URI (MongoDB Atlas connection string)
- [ ] Set CLIENT_URL=https://easyxpense.netlify.app
- [ ] Set ACCESS_TOKEN_EXPIRES=86400
- [ ] Set REFRESH_TOKEN_EXPIRES=604800
- [ ] Verify DEBUG=False in production config

### Frontend (Netlify)
- [ ] Set REACT_APP_API_URL=https://easyxpense.onrender.com
- [ ] Set REACT_APP_NAME=EasyXpense
- [ ] Set REACT_APP_VERSION=1.0.0
- [ ] Build command: `npm run build`
- [ ] Publish directory: `build`
- [ ] Base directory: `frontend`

### MongoDB Atlas
- [ ] Whitelist IP: 0.0.0.0/0 (for Render)
- [ ] Run: `python backend/setup_indexes.py` to create all indexes
- [ ] Verify indexes created successfully

## Post-Deployment

### Backend Verification
- [ ] Health check: `curl https://easyxpense.onrender.com/health`
- [ ] API health: `curl https://easyxpense.onrender.com/api/health`
- [ ] Test registration endpoint
- [ ] Test login endpoint
- [ ] Test JWT token refresh

### Frontend Verification
- [ ] Visit: https://easyxpense.netlify.app
- [ ] Test user registration
- [ ] Test user login
- [ ] Test dashboard loads
- [ ] Test add expense
- [ ] Test create group
- [ ] Test group transactions
- [ ] Test charts render
- [ ] Test logout

### Security Verification
- [ ] CORS only allows frontend domain
- [ ] JWT tokens expire correctly
- [ ] Refresh tokens rotate on use
- [ ] No hardcoded secrets in code
- [ ] All routes require authentication (except auth routes)
- [ ] Group data isolated by user_id

### Performance Verification
- [ ] MongoDB indexes active
- [ ] API response time < 500ms
- [ ] Frontend bundle size < 150KB gzipped
- [ ] Charts load from backend data (no mock data)
- [ ] Pagination works on all list endpoints

## MongoDB Indexes Required

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true, sparse: true })
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true })

// Friends
db.friends.createIndex({ user_id: 1, name: 1 })

// Expenses
db.expenses.createIndex({ user_id: 1, date: -1 })
db.expenses.createIndex({ user_id: 1, category: 1 })
db.expenses.createIndex({ date: -1 })

// Settlements
db.settlements.createIndex({ user_id: 1, date: -1 })

// Groups
db.groups.createIndex({ user_id: 1, created_at: -1 })
db.groups.createIndex({ group_code: 1 }, { unique: true })

// Group Transactions
db.group_transactions.createIndex({ group_id: 1, created_at: -1 })
db.group_transactions.createIndex({ user_id: 1 })
db.group_transactions.createIndex({ paid_by: 1 })

// Refresh Tokens
db.refresh_tokens.createIndex({ user_id: 1 })
db.refresh_tokens.createIndex({ token: 1 }, { unique: true })
db.refresh_tokens.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
```

## Rollback Plan

If deployment fails:
1. Revert to previous Git commit
2. Redeploy backend on Render
3. Redeploy frontend on Netlify
4. Verify health endpoints

## Monitoring

- Monitor Render logs for errors
- Monitor Netlify deployment logs
- Check MongoDB Atlas metrics
- Monitor API response times
- Check error rates in production

## Support

- Backend logs: Render dashboard
- Frontend logs: Browser console + Netlify logs
- Database: MongoDB Atlas dashboard
