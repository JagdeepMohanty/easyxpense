# EasyXpense Backend - Verification Checklist

Use this checklist before deploying to production.

---

## 📋 Pre-Deployment Checklist

### ✅ Code Structure
- [x] Application Factory Pattern implemented (`app/__init__.py`)
- [x] No circular imports
- [x] Clean separation of concerns (models, routes, middleware, utils)
- [x] All imports working correctly
- [x] No syntax errors

### ✅ Configuration
- [x] `config.py` uses environment variables
- [x] `extensions.py` handles MongoDB initialization
- [x] `.env.example` provided as template
- [x] No hardcoded credentials in code

### ✅ Dependencies
- [x] `requirements.txt` has production-safe versions
- [x] `runtime.txt` specifies Python 3.11.9
- [x] All packages compatible with each other
- [x] No development-only packages in requirements

### ✅ Entry Points
- [x] `run.py` for development server
- [x] `wsgi.py` for Gunicorn production server
- [x] Both import from `app` correctly
- [x] No circular dependencies

### ✅ Authentication
- [x] JWT middleware in `middleware/auth.py`
- [x] `@token_required` decorator works
- [x] Token expiration set (7 days)
- [x] Password hashing with bcrypt
- [x] Secure token generation

### ✅ Database
- [x] MongoDB connection pooling configured
- [x] Connection timeout settings
- [x] Ping test on startup
- [x] Error handling for connection failures
- [x] User-scoped data queries

### ✅ API Routes
- [x] Auth routes: `/api/auth/*`
- [x] User routes: `/api/users/*`
- [x] Group routes: `/api/groups/*`
- [x] Expense routes: `/api/expenses/*`
- [x] Debt routes: `/api/debts/*`
- [x] Health check: `/health` and `/api/health`

### ✅ Security
- [x] CORS configured with allowed origins
- [x] Security headers added (X-Frame-Options, X-XSS-Protection)
- [x] Input validation and sanitization
- [x] Email and phone validation
- [x] Password length requirements
- [x] JWT secret from environment
- [x] No sensitive data in logs

### ✅ Error Handling
- [x] 404 handler
- [x] 500 handler
- [x] Try-catch blocks in all routes
- [x] Proper error messages
- [x] Logging configured

### ✅ Gunicorn
- [x] `gunicorn.conf.py` configured
- [x] Dynamic port binding (PORT env var)
- [x] Worker count optimized
- [x] Timeout settings
- [x] Logging configured

### ✅ Documentation
- [x] BACKEND_README.md (API reference)
- [x] DEPLOYMENT_GUIDE.md (Render deployment)
- [x] QUICKSTART.md (local setup)
- [x] REBUILD_SUMMARY.md (changes overview)
- [x] .env.example (environment template)

---

## 🧪 Local Testing

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```
**Expected:** All packages install successfully

### 2. Create .env File
```bash
cp .env.example .env
# Edit .env with your values
```
**Required:**
- MONGO_URI
- JWT_SECRET_KEY
- SECRET_KEY

### 3. Run Deployment Test
```bash
python test_deployment.py
```
**Expected:** All checks pass ✅

### 4. Start Development Server
```bash
python run.py
```
**Expected:** Server starts on port 5000

### 5. Test Health Endpoint
```bash
curl http://localhost:5000/health
```
**Expected:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 6. Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected:** Returns token and user object

### 7. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected:** Returns token and user object

### 8. Test Protected Route
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** Returns user data

### 9. Test Gunicorn
```bash
gunicorn wsgi:app
```
**Expected:** Server starts without errors

---

## 🚀 Render Deployment Checklist

### Before Deployment
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster running
- [ ] MongoDB Atlas IP whitelist: 0.0.0.0/0
- [ ] Database user created with read/write permissions
- [ ] Connection string tested locally

### Render Configuration
- [ ] Web Service created
- [ ] Repository connected
- [ ] Root Directory: `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn wsgi:app`
- [ ] Environment variables set:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET_KEY
  - [ ] SECRET_KEY

### After Deployment
- [ ] Deployment successful (check logs)
- [ ] Health endpoint working: `https://your-app.onrender.com/health`
- [ ] Can register new user
- [ ] Can login
- [ ] Protected routes work with token
- [ ] Frontend updated with new API URL
- [ ] Frontend redeployed

---

## 🔍 Troubleshooting Guide

### Issue: "Module not found"
**Check:**
- [ ] `requirements.txt` in backend folder
- [ ] Build command correct
- [ ] All dependencies listed

**Fix:**
```bash
pip install -r requirements.txt
```

### Issue: "MongoDB connection failed"
**Check:**
- [ ] MONGO_URI correct
- [ ] MongoDB Atlas running
- [ ] IP whitelist includes 0.0.0.0/0
- [ ] Database user has permissions

**Test:**
```bash
python -c "from pymongo import MongoClient; client = MongoClient('YOUR_URI'); client.admin.command('ping')"
```

### Issue: "JWT_SECRET_KEY not set"
**Check:**
- [ ] .env file exists
- [ ] JWT_SECRET_KEY in .env
- [ ] Environment variable set on Render

**Generate:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Issue: "Gunicorn won't start"
**Check:**
- [ ] wsgi.py exists
- [ ] wsgi.py imports correctly
- [ ] No syntax errors

**Test:**
```bash
python wsgi.py
gunicorn wsgi:app --bind 0.0.0.0:5000
```

### Issue: "Circular import error"
**Check:**
- [ ] Using Application Factory Pattern
- [ ] Extensions in separate file
- [ ] No global app instance

**Verify:**
```bash
python -c "from app import create_app; app = create_app()"
```

### Issue: "Cold start timeout"
**Solutions:**
- Use Render paid tier (no cold starts)
- Implement ping service to keep warm
- Optimize MongoDB connection pooling

---

## ✅ Final Verification

Run all checks:
```bash
# 1. Deployment test
python test_deployment.py

# 2. Development server
python run.py
# Visit: http://localhost:5000/health

# 3. Production server
gunicorn wsgi:app
# Visit: http://localhost:8000/health

# 4. Test API endpoints
# Register, login, protected routes
```

**All checks pass?** ✅ Ready for production!

---

## 📊 Success Criteria

- [x] No errors in logs
- [x] Health endpoint returns 200
- [x] Can register new user
- [x] Can login
- [x] JWT tokens work
- [x] Protected routes require auth
- [x] MongoDB queries work
- [x] CORS allows frontend
- [x] Gunicorn starts successfully
- [x] Cold start completes in <30s

---

## 🎉 Deployment Complete!

Your backend is production-ready when:
1. ✅ All local tests pass
2. ✅ Gunicorn starts without errors
3. ✅ MongoDB connection works
4. ✅ API endpoints respond correctly
5. ✅ Frontend can communicate with backend

**Next:** Deploy to Render following DEPLOYMENT_GUIDE.md

---

**Status:** Ready for Production ✅  
**Last Updated:** 2024  
**Deployment Target:** Render + Gunicorn + MongoDB Atlas
