# EasyXpense - Expense Splitting Application

A modern expense splitting web application built with React, Flask, and MongoDB Atlas. Split expenses with friends, track debts, and settle payments easily.

## 🌐 Live Application

- **Frontend**: https://easyxpense.netlify.app
- **Backend API**: https://easyxpense.onrender.com

## 🚀 Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 👤 **User-Scoped Data** - Each user's data is private and isolated
- 💰 Split expenses equally among friends
- 📊 Track who owes what with optimized debt calculations
- 💳 Record settlements and payment history
- 🇮🇳 Indian Rupee (INR) support with proper formatting
- 📱 Responsive design for mobile and desktop
- 🔄 Session persistence across page refreshes

## 🏗️ Tech Stack

### Frontend
- React 19.2.3
- React Router DOM 7.12.0
- Axios 1.13.2
- Deployed on Netlify

### Backend
- Python 3.11
- Flask 3.0.0
- Flask-CORS 4.0.0
- PyMongo 4.6.1
- bcrypt 4.1.2 (Password hashing)
- PyJWT 2.8.0 (JWT tokens)
- Gunicorn 21.2.0
- Deployed on Render

### Database
- MongoDB Atlas (Free Tier)
- Database: `EasyXpense`
- Collections: `users`, `friends`, `expenses`, `settlements`, `groups`

## 📁 Project Structure

```
easyxpense/
├── backend/
│   ├── app/
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Data models (User, Expense, Group)
│   │   ├── routes/         # API endpoints (auth, friends, expenses, etc.)
│   │   ├── utils/          # Utilities (money, sanitization, debt optimizer)
│   │   └── __init__.py     # Flask app initialization
│   ├── wsgi.py             # Production WSGI entry
│   ├── run.py              # Development server
│   ├── migrate_data.py     # Data migration script
│   ├── gunicorn.conf.py    # Gunicorn configuration
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components (Login, Register, Dashboard, etc.)
│   │   ├── services/       # API service
│   │   └── utils/          # Utilities
│   ├── public/
│   │   └── _redirects      # Netlify SPA routing
│   └── package.json        # Node dependencies
├── render.yaml             # Render deployment config
├── netlify.toml            # Netlify deployment config
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.11+
- MongoDB Atlas account

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file:
   ```bash
   MONGO_URI=your_mongodb_uri
   JWT_SECRET_KEY=your-secret-key
   FLASK_ENV=development
   PORT=5000
   ```

   Generate JWT secret:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

5. Run development server:
   ```bash
   python run.py
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Run development server:
   ```bash
   npm start
   ```

## 🌐 Production Deployment

### Render (Backend)

**Environment Variables**:
```
MONGO_URI=mongodb+srv://easyXpense:Jagdeep2607@easyxpense.sfpwthl.mongodb.net/EasyXpense?retryWrites=true&w=majority&appName=EasyXpense
JWT_SECRET_KEY=<generate-secure-key>
FLASK_ENV=production
PORT=10000
GUNICORN_WORKERS=2
```

**Build Command**: `pip install -r requirements.txt`  
**Start Command**: `gunicorn wsgi:app -c gunicorn.conf.py`

### Netlify (Frontend)

**Environment Variables**:
```
REACT_APP_API_URL=https://easyxpense.onrender.com
REACT_APP_NAME=EasyXpense
REACT_APP_VERSION=1.0.0
```

**Build Command**: `npm run build`  
**Publish Directory**: `build`  
**Base Directory**: `frontend`

### MongoDB Atlas

**Network Access**: Add `0.0.0.0/0` to IP whitelist  
**Database User**: `easyXpense` with read/write permissions  
**Database Name**: `EasyXpense`

**Required Indexes**:
```javascript
db.users.createIndex({ email: 1 }, { unique: true, sparse: true })
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true })
db.friends.createIndex({ user_id: 1, name: 1 })
db.expenses.createIndex({ user_id: 1, date: -1 })
db.settlements.createIndex({ user_id: 1, date: -1 })
db.groups.createIndex({ user_id: 1, created_at: -1 })
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Health
- `GET /health` - Health check
- `GET /api/health` - Detailed health check

### Friends (Protected)
- `GET /api/friends` - List user's friends
- `POST /api/friends` - Add new friend
- `PUT /api/friends/:id` - Update friend
- `DELETE /api/friends/:id` - Delete friend

### Expenses (Protected)
- `GET /api/expenses` - List user's expenses
- `POST /api/expenses` - Create new expense

### Debts (Protected)
- `GET /api/debts` - Get optimized debt settlements

### Settlements (Protected)
- `GET /api/settlements` - List settlement history
- `POST /api/settlements` - Record new settlement

### Groups (Protected)
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
- `DELETE /api/groups/:id` - Delete group

**Note**: All endpoints except auth and health require JWT token in Authorization header.

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication with type validation
- **Refresh Tokens** - 7-day sessions with automatic token rotation
- **Rate Limiting** - 5 login attempts per 15 minutes per identifier
- **Password Hashing** - bcrypt with salt rounds (10-12)
- **User-Scoped Data** - All data isolated by user_id
- **Protected Routes** - All endpoints require authentication
- **Token Rotation** - Old refresh tokens revoked on refresh
- **Token Reuse Prevention** - Database validation before accepting tokens
- **Automatic Token Refresh** - Seamless frontend token renewal
- **Input Validation** - Length limits and format validation
- **CORS** - Restricted to Netlify origin only
- **Input Sanitization** - All user inputs sanitized
- **Request Size Limits** - 10MB max
- **Security Headers** - X-Frame-Options, X-XSS-Protection, HSTS
- **No Hardcoded Credentials** - Environment variable configuration
- **Session Management** - Single session per user, all tokens revoked on login
- **Generic Error Messages** - "Invalid credentials" for all auth failures

## ⚡ Performance

- Optimized debt calculation algorithm (60-90% fewer transactions)
- MongoDB field projection (only fetches required fields)
- Connection pooling for MongoDB
- Database indexes on all query fields
- Pagination enforcement (max 50 items per page)
- React component memoization (Button, Pagination)
- useCallback for event handlers
- Gunicorn with 2 workers for Render free tier
- 30s timeout handling for cold starts
- Automatic retry logic on frontend
- Bundle size: 99.25 KB gzipped

## 🧪 Testing

### Backend
```bash
cd backend
python run.py
# Visit http://localhost:5000/health
```

### Frontend
```bash
cd frontend
npm start
# Visit http://localhost:3000
```

### Production
```bash
# Backend health check
curl https://easyxpense.onrender.com/health

# Frontend
curl -I https://easyxpense.netlify.app/
```

## 📊 Free Tier Limits

- **Render**: 512MB RAM, 750 hours/month
- **Netlify**: 100GB bandwidth/month
- **MongoDB Atlas**: 512MB storage

Current usage is well within all limits.

## 📚 Documentation

- **Production Hardening**: See `PRODUCTION_HARDENING.md` - Complete hardening summary
- **Production Deployment**: See `PRODUCTION_READY.md` - Complete deployment summary
- **Security Checklist**: See `PRODUCTION_SECURITY.md` - Comprehensive security verification
- **Environment Setup**: See `DEPLOYMENT.md` - Environment variables and configuration
- **Backend Auth**: See `backend/AUTH_IMPLEMENTATION.md` - JWT authentication details
- **Backend Authorization**: See `backend/AUTHORIZATION_IMPLEMENTATION.md` - User-scoped data isolation
- **Refresh Tokens**: See `backend/REFRESH_TOKEN_IMPLEMENTATION.md` - Token rotation system
- **Frontend Auth**: See `frontend/FRONTEND_REFRESH_TOKEN.md` - Automatic token refresh
- **Data Migration**: See `backend/migrate_data.py` - User data migration script

## 🤝 Contributing

This is a portfolio project. Feel free to fork and modify for your own use.

## 📄 License

This project is for educational and portfolio purposes.

## 👨‍💻 Author

Jagdeep Mohanty

## 🙏 Acknowledgments

Built with React, Flask, and MongoDB Atlas. Deployed on Netlify and Render free tiers.

---

**Made with ❤️ for expense splitting in India** 🇮🇳
