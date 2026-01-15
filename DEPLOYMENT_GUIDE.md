# 🚀 EasyXpense Deployment Guide

## ✅ Current Status

**Live URLs:**
- Frontend: https://easyxpense.netlify.app
- Backend: https://easyxpense.onrender.com
- Database: MongoDB Atlas (easyxpense_db)

**Status:** ✅ Production Ready

---

## 🔐 Environment Variables

### Render Backend
```
MONGO_URI=mongodb+srv://easyXpense:Jagdeep2607@easyxpense.uafnhae.mongodb.net/easyxpense_db?retryWrites=true&w=majority
FLASK_ENV=production
PORT=10000
```

### Netlify Frontend
```
REACT_APP_API_URL=https://easyxpense.onrender.com
REACT_APP_NAME=EasyXpense
REACT_APP_VERSION=1.0.0
```

### MongoDB Atlas
- **IP Whitelist:** 0.0.0.0/0 (Allow from anywhere)
- **Database:** easyxpense_db
- **Username:** easyXpense
- **Password:** Jagdeep2607

---

## 📋 Deployment Checklist

### ✅ Backend (Render)
- [x] Repository connected
- [x] Build command: `pip install -r requirements.txt`
- [x] Start command: `gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
- [x] Root directory: `backend`
- [x] Environment variables set
- [x] Python version: 3.11

### ✅ Frontend (Netlify)
- [x] Repository connected
- [x] Base directory: `frontend`
- [x] Build command: `npm run build`
- [x] Publish directory: `frontend/build`
- [x] Environment variables set
- [x] SPA redirects configured

### ✅ Database (MongoDB Atlas)
- [x] Cluster running
- [x] IP whitelist configured
- [x] Database user created
- [x] Database name: easyxpense_db
- [x] Collections auto-created

---

## 🧪 Verification Steps

### 1. Test Backend Health
```bash
curl https://easyxpense.onrender.com/health
```
Expected: `{"status":"healthy","database":"connected"}`

### 2. Test API Connectivity
```bash
curl https://easyxpense.onrender.com/api/test
```
Expected: `{"success":true,"message":"API is working","database":"connected"}`

### 3. Test Frontend
Visit: https://easyxpense.netlify.app/test
Click: "Run Connection Tests"
Expected: All tests show ✅

### 4. Test Full Flow
1. Go to https://easyxpense.netlify.app/friends
2. Add a friend
3. Go to /add-expense
4. Create an expense
5. Check /dashboard
6. Verify data appears

---

## 🔄 Redeployment Process

### Backend Redeploy
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render auto-deploys in 2-3 minutes.

### Frontend Redeploy
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Netlify auto-deploys in 1-2 minutes.

### Manual Redeploy
- **Render:** Dashboard → Manual Deploy → Deploy latest commit
- **Netlify:** Dashboard → Deploys → Trigger deploy

---

## 🐛 Common Issues & Solutions

### Issue: Backend shows "Database not available"
**Solution:** Check MONGO_URI in Render environment variables

### Issue: Frontend shows "Network Error"
**Solution:** 
1. Verify backend is running: `curl https://easyxpense.onrender.com/health`
2. Check REACT_APP_API_URL in Netlify
3. Check browser console for CORS errors

### Issue: MongoDB connection timeout
**Solution:** 
1. Verify IP whitelist includes 0.0.0.0/0
2. Check MongoDB cluster is not paused
3. Verify credentials in MONGO_URI

### Issue: 404 on frontend routes
**Solution:** Already fixed with `_redirects` file and `netlify.toml`

---

## 📊 Monitoring

### Backend Logs
- **Render:** Dashboard → Logs
- Look for: "MongoDB connection successful. Database: easyxpense_db"

### Frontend Logs
- **Netlify:** Dashboard → Deploys → Deploy log
- Check for build errors

### Database Monitoring
- **MongoDB Atlas:** Dashboard → Metrics
- Monitor connections, operations, and storage

---

## 🔧 Maintenance

### Update Dependencies

**Backend:**
```bash
cd backend
pip list --outdated
pip install --upgrade <package>
pip freeze > requirements.txt
```

**Frontend:**
```bash
cd frontend
npm outdated
npm update
```

### Database Backup
- MongoDB Atlas → Clusters → Backup
- Configure automated backups
- Test restore process

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Flask Docs:** https://flask.palletsprojects.com
- **React Docs:** https://react.dev

---

## ✅ Success Criteria

Application is working correctly when:
- ✅ Backend health check returns "connected"
- ✅ Frontend test page shows all tests passing
- ✅ Can add friends without errors
- ✅ Can create expenses without errors
- ✅ Data persists in MongoDB
- ✅ Dashboard displays correct data
- ✅ Debt tracker calculates correctly
- ✅ Payment history shows all records

---

**Last Updated:** 2024
**Status:** ✅ Production Ready
**Version:** 1.0.0
