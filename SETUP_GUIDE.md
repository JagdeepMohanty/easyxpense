# EasyXpense Local Development Setup

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone Repository
```bash
git clone https://github.com/JagdeepMohanty/easyxpense.git
cd easyxpense
```

### Step 2: Backend Setup
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

# Edit .env with your MongoDB URI (or use the provided one)
# MONGO_URI=mongodb+srv://easyXpense:Jagdeep2607@easyxpense.uafnhae.mongodb.net/easyxpense_db?retryWrites=true&w=majority
# FLASK_ENV=development
# PORT=5000

# Start backend
python run.py
```

Backend will run on http://localhost:5000

### Step 3: Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
# REACT_APP_API_URL=http://localhost:5000
# REACT_APP_NAME=EasyXpense
# REACT_APP_VERSION=1.0.0

# Start frontend
npm start
```

Frontend will run on http://localhost:3000

### Step 4: Verify Setup
1. Backend: http://localhost:5000/health
2. Frontend: http://localhost:3000
3. Test page: http://localhost:3000/test

---

## 📋 Prerequisites

### Required Software
- **Node.js** 16+ and npm
- **Python** 3.11+
- **Git**

### Check Versions
```bash
node --version  # Should be 16+
npm --version
python --version  # Should be 3.11+
git --version
```

---

## 🔧 Development Commands

### Backend Commands
```bash
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Run backend
python run.py

# Run with auto-reload
FLASK_ENV=development python run.py

# Test MongoDB connection
python verify_deployment.py

# Install new package
pip install <package>
pip freeze > requirements.txt
```

### Frontend Commands
```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install new package
npm install <package>
```

---

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Test endpoint
curl http://localhost:5000/api/test

# Get friends
curl http://localhost:5000/api/friends

# Add friend
curl -X POST http://localhost:5000/api/friends \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

### Test Frontend
1. Open http://localhost:3000/test
2. Click "Run Connection Tests"
3. All tests should pass ✅

---

## 🐛 Common Issues

### Backend Issues

**Issue: ModuleNotFoundError**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

**Issue: Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

**Issue: MongoDB connection failed**
- Check MONGO_URI in .env
- Verify internet connection
- Check MongoDB Atlas IP whitelist

### Frontend Issues

**Issue: npm install fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Issue: Port 3000 already in use**
- React will automatically suggest port 3001
- Or kill process on port 3000

**Issue: Network Error**
- Verify backend is running on http://localhost:5000
- Check REACT_APP_API_URL in .env
- Check browser console for errors

---

## 📁 Project Structure

```
easyxpense/
├── backend/              # Flask backend
│   ├── app/
│   │   ├── models/      # Database models
│   │   ├── routes/      # API endpoints
│   │   └── utils/       # Helper functions
│   ├── run.py           # Development server
│   ├── wsgi.py          # Production server
│   └── requirements.txt # Python dependencies
│
├── frontend/            # React frontend
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── utils/       # Helper functions
│   │   └── styles/      # CSS styles
│   └── package.json     # Node dependencies
│
├── README.md            # Main documentation
├── DEPLOYMENT_GUIDE.md  # Deployment instructions
└── ENVIRONMENT_VARIABLES.md  # Environment config
```

---

## 🔄 Git Workflow

### Make Changes
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# ... edit files ...

# Stage changes
git add .

# Commit changes
git commit -m "Add your feature"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request on GitHub
```

### Update from Main
```bash
git checkout main
git pull origin main
```

---

## 🚀 Deploy to Production

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

### Quick Deploy
```bash
# Commit all changes
git add .
git commit -m "Update application"
git push origin main

# Render and Netlify will auto-deploy
```

---

## 📚 Additional Resources

- **README.md** - Complete project documentation
- **DEPLOYMENT_GUIDE.md** - Production deployment guide
- **ENVIRONMENT_VARIABLES.md** - Environment configuration
- **API_DOCUMENTATION.md** - API endpoint details

---

## ✅ Setup Complete!

You should now have:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:3000
- ✅ MongoDB connected
- ✅ All features working

**Start building! 🎉**
