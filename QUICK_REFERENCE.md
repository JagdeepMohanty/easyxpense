# 🚀 Quick Deployment Reference

## Environment Variables

### Render (Backend)
```
FLASK_ENV=production
JWT_SECRET_KEY=<generate-secure-32-char-key>
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/EasyXpense
CLIENT_URL=https://easyxpense.netlify.app
PORT=10000
GUNICORN_WORKERS=2
```

### Netlify (Frontend)
```
VITE_API_BASE_URL=https://easyxpense.onrender.com
```

## Generate JWT Secret
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Git Commands
```bash
cd backend
git add .
git commit -m "Production cleanup and hardening"
git push origin main
```

## Health Check
```bash
curl https://easyxpense.onrender.com/health
```

## Token Expiry
- Access Token: 24 hours
- Refresh Token: 7 days
- Rotation: On every refresh
- Storage: localStorage

## Security
- ✅ JWT_SECRET_KEY required
- ✅ DEBUG disabled in production
- ✅ Secure cookies (HTTPS only)
- ✅ CORS restricted to Netlify
- ✅ Input sanitization
- ✅ Token rotation
- ✅ No hardcoded secrets
