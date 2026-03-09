# EasyXpense - Installation & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (Frontend)
- Python 3.11+ (Backend)
- MongoDB Atlas account

---

## 📦 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd easyxpense
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your values:
# MONGO_URI=mongodb+srv://...
# JWT_SECRET_KEY=<generate-secure-key>
# FLASK_ENV=development
# PORT=5000

# Generate JWT secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Setup MongoDB indexes
python setup_indexes.py

# Run development server
python wsgi.py
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🔧 Configuration

### Backend Environment Variables

```bash
# Required
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/EasyXpense
JWT_SECRET_KEY=<your-secure-key>
FLASK_ENV=development
PORT=5000

# Optional
SECRET_KEY=<your-secret-key>
```

### Frontend Environment Variables

```bash
# Required
VITE_API_URL=http://localhost:5000
```

---

## 🗄️ MongoDB Setup

### 1. Create MongoDB Atlas Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free tier

### 2. Create Cluster
- Choose free tier (M0)
- Select region closest to you
- Create cluster

### 3. Create Database User
- Go to Database Access
- Add new database user
- Set username and password
- Grant read/write permissions

### 4. Configure Network Access
- Go to Network Access
- Add IP Address
- Allow access from anywhere: `0.0.0.0/0`

### 5. Get Connection String
- Go to Clusters
- Click "Connect"
- Choose "Connect your application"
- Copy connection string
- Replace `<password>` with your password
- Add database name: `/EasyXpense`

### 6. Setup Indexes
```bash
cd backend
python setup_indexes.py
```

---

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test health endpoint
curl http://localhost:5000/health

# Test v1 endpoints
curl http://localhost:5000/api/v1/auth/login

# Test legacy endpoints
curl http://localhost:5000/api/auth/login
```

### Frontend Testing
```bash
cd frontend

# Run dev server
npm run dev

# Visit http://localhost:5173
# Test registration
# Test login
# Test all features
```

---

## 🏗️ Build for Production

### Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment
export FLASK_ENV=production

# Run with Gunicorn
gunicorn wsgi:app -c gunicorn.conf.py
```

### Frontend
```bash
cd frontend

# Build
npm run build

# Preview
npm run preview

# Output in dist/ directory
```

---

## 🚀 Deployment

### Backend (Render)

1. **Create Web Service**
   - Connect GitHub repository
   - Select backend directory
   - Choose Python environment

2. **Configure Build**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn wsgi:app -c gunicorn.conf.py`

3. **Set Environment Variables**
   ```
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET_KEY=<your-jwt-secret>
   FLASK_ENV=production
   PORT=10000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

### Frontend (Netlify)

1. **Create New Site**
   - Connect GitHub repository
   - Select frontend directory

2. **Configure Build**
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Base Directory: `frontend`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment

---

## 📝 Post-Deployment

### 1. Update CORS Origins
Edit `backend/app/__init__.py`:
```python
CORS(app, 
     origins=[
         'https://your-frontend.netlify.app',
         'http://localhost:3000',
         'http://localhost:5173'
     ],
     ...
)
```

### 2. Test Production
- Visit frontend URL
- Test registration
- Test login
- Test all features
- Check browser console for errors

### 3. Monitor
- Check Render logs
- Check Netlify logs
- Monitor MongoDB Atlas

---

## 🔍 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
- Check MONGO_URI format
- Verify network access (0.0.0.0/0)
- Check database user credentials

**Import Errors**
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

**Port Already in Use**
- Change PORT in .env
- Kill process: `lsof -ti:5000 | xargs kill` (Mac/Linux)

### Frontend Issues

**API Connection Failed**
- Check VITE_API_URL in .env
- Verify backend is running
- Check CORS configuration

**Build Errors**
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Clear cache: `npm cache clean --force`

**Module Not Found**
- Check import paths
- Verify file exists
- Check case sensitivity

---

## 📊 Verification Checklist

### Backend
- [ ] MongoDB connected
- [ ] Health endpoint works
- [ ] v1 endpoints work
- [ ] Legacy endpoints work
- [ ] Authentication works
- [ ] CRUD operations work

### Frontend
- [ ] Dev server runs
- [ ] Build succeeds
- [ ] Login works
- [ ] Registration works
- [ ] All pages load
- [ ] API calls work
- [ ] Toast notifications work
- [ ] Loading skeletons show

---

## 🎯 Development Workflow

### 1. Start Backend
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
python wsgi.py
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Make Changes
- Edit code
- Save files
- Hot reload happens automatically

### 4. Test Changes
- Test in browser
- Check console for errors
- Verify API calls

### 5. Commit Changes
```bash
git add .
git commit -m "Description"
git push
```

---

## 📚 Additional Resources

### Documentation
- [COMPLETE_SUMMARY.md](./COMPLETE_SUMMARY.md) - Full refactoring summary
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture diagrams
- [FRONTEND_REFACTORING.md](./FRONTEND_REFACTORING.md) - Frontend details
- [REFACTORING_PHASE2.md](./REFACTORING_PHASE2.md) - Backend details

### API Documentation
- Health: `GET /health`
- Auth: `POST /api/v1/auth/login`
- Expenses: `GET /api/v1/expenses`
- Friends: `GET /api/v1/friends`
- Debts: `GET /api/v1/debts`
- Analytics: `GET /api/v1/analytics/monthly`

### Tech Stack
- **Backend**: Flask 3.0, Python 3.11, MongoDB, Motor, Pydantic
- **Frontend**: React 18, Vite, TailwindCSS, React Query, React Router
- **Database**: MongoDB Atlas
- **Deployment**: Render (backend), Netlify (frontend)

---

## 🆘 Getting Help

### Check Logs
**Backend:**
```bash
# Development
python wsgi.py

# Production (Render)
# Check Render dashboard logs
```

**Frontend:**
```bash
# Development
npm run dev
# Check browser console

# Production (Netlify)
# Check Netlify dashboard logs
```

### Common Commands
```bash
# Backend
pip list                    # List installed packages
pip freeze                  # Show dependencies
python --version            # Check Python version

# Frontend
npm list                    # List installed packages
npm outdated                # Check outdated packages
node --version              # Check Node version
```

---

## ✅ Success!

If everything is working:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 5173
- ✅ MongoDB connected
- ✅ Can register new user
- ✅ Can login
- ✅ Can add expense
- ✅ Can add friend
- ✅ Dashboard loads

**You're ready to develop!** 🎉

---

**Need Help?** Check the documentation or review the troubleshooting section.
