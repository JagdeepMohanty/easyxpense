# EasyXpense Backend - Quick Start

Get the backend running locally in 5 minutes.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Create .env File
```bash
# Copy example
cp .env.example .env

# Edit .env with your values
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/EasyXpense
JWT_SECRET_KEY=your-jwt-secret
SECRET_KEY=your-secret
```

### 3. Generate Secret Keys
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy output and paste into `.env` file for both JWT_SECRET_KEY and SECRET_KEY.

### 4. Run Server
```bash
python run.py
```

Server starts at: http://localhost:5000

### 5. Test Health Check
Open browser: http://localhost:5000/health

Should see:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## ✅ Verify Installation

Run deployment test:
```bash
python test_deployment.py
```

All checks should pass ✅

## 🧪 Test API

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copy the `token` from response.

### Get User (Protected)
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Common Issues

### "Module not found"
```bash
pip install -r requirements.txt
```

### "MongoDB connection failed"
- Check MONGO_URI in .env
- Verify MongoDB Atlas IP whitelist
- Test connection string in MongoDB Compass

### "JWT_SECRET_KEY not set"
- Ensure .env file exists
- Check .env has JWT_SECRET_KEY=...
- Restart server after editing .env

## 🚀 Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for Render deployment.

## 📚 API Documentation

See [BACKEND_README.md](BACKEND_README.md) for complete API reference.

---

**Ready to code!** 🎉
