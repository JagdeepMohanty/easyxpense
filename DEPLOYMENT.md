# EasyXpense - Production Deployment Guide

## 🚀 Render (Backend)

Set these environment variables in Render Dashboard:

```
MONGO_URI=mongodb+srv://easyXpense:Jagdeep2607@easyxpense.sfpwthl.mongodb.net/EasyXpense?retryWrites=true&w=majority&appName=EasyXpense

JWT_SECRET_KEY=<generate-secure-random-key>

FLASK_ENV=production

PORT=10000

GUNICORN_WORKERS=2
```

**Generate JWT Secret Key:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**CRITICAL**: Never commit JWT_SECRET_KEY to Git. Generate a new one for production.

**Build Command**: `pip install -r requirements.txt`  
**Start Command**: `gunicorn wsgi:app -c gunicorn.conf.py`  
**Python Version**: 3.11.0

---

## 🌐 Netlify (Frontend)

Set these environment variables in Netlify Dashboard:

```
REACT_APP_API_URL=https://easyxpense.onrender.com

REACT_APP_NAME=EasyXpense

REACT_APP_VERSION=1.0.0
```

**Build Command**: `npm run build`  
**Publish Directory**: `build`  
**Base Directory**: `frontend`

---

## 🗄️ MongoDB Atlas

**Network Access**: Add `0.0.0.0/0` to IP whitelist  
**Database User**: `easyXpense` / `Jagdeep2607`  
**Database Name**: `EasyXpense`  
**Collections**: Auto-created on first use

**Required Indexes:**
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true, sparse: true })
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true })

// Refresh Tokens
db.refresh_tokens.createIndex({ user_id: 1 })
db.refresh_tokens.createIndex({ expires_at: 1 })
db.refresh_tokens.createIndex({ token_hash: 1 }, { unique: true })

// Friends, Expenses, Settlements, Groups
db.friends.createIndex({ user_id: 1, name: 1 })
db.expenses.createIndex({ user_id: 1, date: -1 })
db.settlements.createIndex({ user_id: 1, date: -1 })
db.groups.createIndex({ user_id: 1, created_at: -1 })
```

---

## ✅ Verification

### Backend Health Check
```bash
curl https://easyxpense.onrender.com/health
```
Expected: `{"status": "healthy", "database": "connected"}`

### Frontend
```bash
curl -I https://easyxpense.netlify.app/
```
Expected: `200 OK`

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Access Tokens**: 24-hour expiry, type-validated
- **Refresh Tokens**: 7-day expiry, SHA-256 hashed storage, automatic rotation
- **Token Rotation**: Old refresh token revoked when new one issued
- **Password Security**: bcrypt hashing with salt rounds
- **User-Scoped Data**: All data isolated by user_id
- **Protected Routes**: All endpoints require valid access token

### Infrastructure Security
- Never commit `.env` files to Git
- All credentials stored in environment variables
- CORS restricted to Netlify origin only
- MongoDB IP whitelist set to allow Render connections
- Request size limits (10MB max)
- Security headers (X-Frame-Options, X-XSS-Protection, HSTS)

### Token Lifecycle
1. **Login/Register**: User receives access_token (24h) + refresh_token (7d)
2. **API Calls**: Frontend sends access_token in Authorization header
3. **Token Expiry**: Frontend automatically refreshes using refresh_token
4. **Token Rotation**: New refresh_token issued, old one revoked
5. **Logout**: Refresh token revoked in database
6. **Session End**: After 7 days, user must re-login

### Production Checklist
- ✅ No hardcoded secrets in code
- ✅ JWT_SECRET_KEY in environment variables
- ✅ MongoDB indexes created
- ✅ CORS configured for production origin
- ✅ Frontend build passes (CI=true, 0 warnings)
- ✅ Refresh token rotation enabled
- ✅ Token reuse prevention implemented
- ✅ Automatic token cleanup on logout
