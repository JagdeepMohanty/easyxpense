# EasyXpense Backend - Render Deployment Guide

Complete guide to deploy the Flask backend on Render.

## 📋 Prerequisites

1. **Render Account**: Sign up at https://render.com
2. **MongoDB Atlas**: Database cluster ready
3. **GitHub Repository**: Code pushed to GitHub

## 🔧 Step 1: Prepare MongoDB Atlas

### 1.1 Network Access
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.2 Database User
1. Go to Database Access
2. Create user with read/write permissions
3. Save username and password

### 1.3 Get Connection String
1. Go to Database → Connect
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your password
5. Replace `<dbname>` with `EasyXpense`

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/EasyXpense
```

## 🚀 Step 2: Deploy on Render

### 2.1 Create Web Service
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 2.2 Configure Service

**Basic Settings:**
- **Name**: `easyxpense-backend` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`

**Build & Deploy:**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn wsgi:app`

### 2.3 Environment Variables

Click "Advanced" → Add Environment Variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/EasyXpense
JWT_SECRET_KEY=<generate-secure-key>
SECRET_KEY=<generate-secure-key>
```

**Generate secure keys:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Run this twice to get two different keys.

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Render will show deployment logs

## ✅ Step 3: Verify Deployment

### 3.1 Check Health Endpoint
Once deployed, visit:
```
https://your-app-name.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 3.2 Test API Endpoints

**Register User:**
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔄 Step 4: Update Frontend

Update your frontend `.env` file:
```
VITE_API_URL=https://your-app-name.onrender.com
```

Redeploy frontend on Netlify.

## 🐛 Troubleshooting

### Issue: "Application failed to respond"
**Solution:**
- Check Render logs for errors
- Verify MONGO_URI is correct
- Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0

### Issue: "Module not found"
**Solution:**
- Verify `requirements.txt` is in backend folder
- Check build command: `pip install -r requirements.txt`
- Ensure `runtime.txt` specifies Python 3.11.9

### Issue: "Database connection failed"
**Solution:**
- Test MongoDB connection string locally
- Verify database user has correct permissions
- Check MongoDB Atlas cluster is running

### Issue: "Token errors"
**Solution:**
- Ensure JWT_SECRET_KEY is set in environment variables
- Verify SECRET_KEY is also set
- Check keys are not empty strings

### Issue: "Cold start timeout"
**Solution:**
- Render free tier has cold starts (first request slow)
- Consider upgrading to paid tier for always-on
- Or use a ping service to keep it warm

## 📊 Monitoring

### View Logs
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor real-time logs

### Check Metrics
1. Go to "Metrics" tab
2. View CPU, Memory, Request metrics
3. Set up alerts if needed

## 🔐 Security Checklist

- [x] MongoDB Atlas IP whitelist configured
- [x] Strong JWT_SECRET_KEY generated
- [x] Strong SECRET_KEY generated
- [x] CORS origins restricted to your frontend
- [x] HTTPS enabled (automatic on Render)
- [x] Environment variables not in code
- [x] Database credentials secure

## 🚀 Production Best Practices

### 1. Use Custom Domain (Optional)
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records

### 2. Enable Auto-Deploy
- Render auto-deploys on git push to main branch
- Disable if you want manual deploys

### 3. Set Up Health Checks
- Render automatically uses `/health` endpoint
- Restarts service if health check fails

### 4. Monitor Performance
- Check response times in Metrics
- Optimize slow endpoints
- Consider caching for frequent queries

### 5. Backup Database
- MongoDB Atlas has automatic backups
- Configure backup schedule in Atlas

## 💰 Render Free Tier Limits

- **RAM**: 512 MB
- **Hours**: 750 hours/month (enough for 1 service)
- **Cold Starts**: Service spins down after 15 min inactivity
- **Build Minutes**: 500 minutes/month

## 🎉 Success!

Your backend is now live at:
```
https://your-app-name.onrender.com
```

Update your frontend and start using EasyXpense!

## 📞 Support

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Flask Docs**: https://flask.palletsprojects.com

---

**Deployment Status**: ✅ Production Ready
