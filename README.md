# EasyXpense - Production Ready

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
- 🎨 Dark/Light theme toggle

## 🏗️ Tech Stack

### Frontend
- React 18.2.0
- Vite 4.4.0
- React Router DOM 6.8.0
- Axios 1.13.5 (Security patched)
- Tailwind CSS 3.4.19
- Recharts 2.8.0
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
│   │   ├── models/         # Data models
│   │   ├── routes/         # API endpoints
│   │   ├── utils/          # Utilities
│   │   └── __init__.py     # Flask app initialization
│   ├── wsgi.py             # Production WSGI entry
│   ├── setup_indexes.py    # MongoDB index setup
│   ├── gunicorn.conf.py    # Gunicorn configuration
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth & Theme contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   └── utils/          # Utilities
│   ├── public/
│   │   └── _redirects      # Netlify SPA routing
│   ├── vite.config.js      # Vite configuration
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
   venv\\Scripts\\activate  # Windows
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
   python -c \"import secrets; print(secrets.token_urlsafe(32))\"
   ```

5. Setup MongoDB indexes:
   ```bash
   python setup_indexes.py
   ```

6. Run development server:
   ```bash
   python wsgi.py
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
   VITE_API_URL=http://localhost:5000
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 🌐 Production Deployment

### Render (Backend)

**Environment Variables**:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/EasyXpense
JWT_SECRET_KEY=<generate-secure-key>
FLASK_ENV=production
PORT=10000
```

**Build Command**: `pip install -r requirements.txt`  
**Start Command**: `gunicorn wsgi:app -c gunicorn.conf.py`

### Netlify (Frontend)

**Environment Variables**:
```
VITE_API_URL=https://your-backend.onrender.com
```

**Build Command**: `npm run build`  
**Publish Directory**: `dist`  
**Base Directory**: `frontend`

### MongoDB Atlas Setup

1. **Network Access**: Add `0.0.0.0/0` to IP whitelist
2. **Database User**: Create user with read/write permissions
3. **Database Name**: `EasyXpense`
4. **Run Index Setup**: `python setup_indexes.py`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Health
- `GET /health` - Health check

### Friends (Protected)
- `GET /api/friends` - List user's friends
- `POST /api/friends` - Add new friend
- `PUT /api/friends/:id` - Update friend
- `DELETE /api/friends/:id` - Delete friend

### Expenses (Protected)
- `GET /api/expenses` - List user's expenses
- `POST /api/expenses` - Create new expense

### Groups (Protected)
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
- `DELETE /api/groups/:id` - Delete group

### Analytics (Protected)
- `GET /api/analytics/monthly` - Monthly expense summary
- `GET /api/analytics/categories` - Category breakdown

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **User-Scoped Data** - All data isolated by user_id
- **Protected Routes** - All endpoints require authentication
- **Input Validation** - Length limits and format validation
- **CORS Protection** - Restricted to allowed origins
- **Input Sanitization** - All user inputs sanitized
- **Security Headers** - X-Frame-Options, X-XSS-Protection
- **URL Validation** - SSRF protection in API calls
- **Environment Variables** - No hardcoded credentials

## ⚡ Performance Optimizations

- **Frontend**: Component memoization, lazy loading, Vite bundling
- **Backend**: MongoDB indexing, connection pooling, optimized queries
- **Database**: Comprehensive indexes on all query fields
- **Deployment**: Gunicorn workers, CDN caching

## 🧪 Testing

### Backend
```bash
cd backend
python wsgi.py
# Visit http://localhost:5000/health
```

### Frontend
```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

### Production Build
```bash
cd frontend
npm run build
npm run preview
```

## 📊 Free Tier Limits

- **Render**: 512MB RAM, 750 hours/month
- **Netlify**: 100GB bandwidth/month
- **MongoDB Atlas**: 512MB storage

## 🤝 Contributing

This is a portfolio project. Feel free to fork and modify for your own use.

## 📄 License

This project is for educational and portfolio purposes.

## 👨💻 Author

Jagdeep Mohanty

---

**Production Ready ✅** - All security vulnerabilities fixed, dependencies updated, code optimized, and deployment configurations added.