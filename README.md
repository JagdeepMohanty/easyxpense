# EasyXpense - Expense Splitting Application

A modern expense splitting application built with React frontend and Python Flask backend, designed for Indian Rupee (INR) transactions.

## 🌐 Live Application

- **Frontend**: https://easyxpense.netlify.app
- **Backend**: Deployed on Render

## 🏗️ Project Structure

```
/
├── frontend/                # React.js application (Netlify)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── utils/           # Utility functions
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                 # Flask application (Render)
│   ├── app/
│   │   ├── routes/          # API route handlers
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── __init__.py      # Flask app factory
│   ├── run.py               # Application entry point
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
│
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MongoDB Atlas account

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

5. **Start the backend server:**
   ```bash
   python run.py
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🔧 Environment Configuration

### Backend (.env)
```env
# MongoDB Connection (Required)
MONGO_URI=mongodb+srv://<DB_USER>:<DB_PASSWORD>@easyxpense.uafnhae.mongodb.net/easyxpense

# JWT Secret (Required)
JWT_SECRET=your-super-secure-jwt-secret-key

# Flask Configuration
FLASK_ENV=production
PORT=5000
```

### Frontend (.env)
```env
# API Base URL (Required)
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com

# App Configuration
VITE_APP_NAME=EasyXpense
VITE_APP_VERSION=1.0.0
```

## 🌟 Features

- **🔐 Secure Authentication**: JWT-based user authentication with bcrypt password hashing
- **👥 Friend Management**: Add and manage friends by email
- **💰 Expense Tracking**: Create and track shared expenses in Indian Rupees (₹)
- **📊 Debt Calculation**: Automatic debt calculation and tracking between friends
- **💳 Settlement System**: Record payments to settle debts
- **🇮🇳 INR Currency**: Native Indian Rupee support with proper formatting
- **📱 Responsive Design**: Mobile-friendly interface
- **🛡️ Input Validation**: Comprehensive validation on both frontend and backend

## 🚀 Production Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FLASK_ENV=production`
3. Deploy with: `gunicorn run:app`

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variable: `VITE_API_BASE_URL`

## 📊 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user profile

### Friends Management
- `GET /api/friends` - Get user's friends list
- `POST /api/friends/add` - Add a friend by email

### Expense Management
- `GET /api/expenses` - Get user's expenses
- `POST /api/expenses` - Create a new expense

### Settlements
- `GET /api/settlements` - Get user's settlements
- `POST /api/settlements` - Create a new settlement

### Debt Tracking
- `GET /api/debts` - Get debt summary with all friends

### System
- `GET /api/health` - Health check endpoint

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite** - Fast build tool and dev server
- **Netlify** - Hosting platform

### Backend
- **Python Flask** - Lightweight web framework
- **PyMongo** - MongoDB driver for Python
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Gunicorn** - WSGI HTTP Server
- **Render** - Hosting platform

### Database
- **MongoDB Atlas** - Cloud-hosted MongoDB

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Environment variable protection
- Graceful error handling

## 📱 How to Use

1. **Register/Login**: Create a new account or login with existing credentials
2. **Add Friends**: Add friends by their email addresses
3. **Create Expenses**: Add shared expenses with selected participants
4. **Track Debts**: View who owes what in the debt tracker
5. **Settle Up**: Record payments to settle debts between friends

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify `MONGO_URI` in environment variables
   - Check MongoDB Atlas IP whitelist
   - Ensure database name is correct

2. **CORS Errors**
   - Verify frontend URL is whitelisted in backend
   - Check if both services are running

3. **Authentication Issues**
   - Verify `JWT_SECRET` is set
   - Check if token is being sent in request headers

4. **Deployment Issues**
   - Ensure all environment variables are set in hosting platforms
   - Check build logs for errors

## 📄 License

This project is for educational and portfolio purposes.

---

**Made with ❤️ for expense splitting in India** 🇮🇳