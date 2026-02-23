# EasyXpense Backend - Production Ready

Flask + MongoDB backend for EasyXpense expense splitting application.

## 🚀 Quick Start

### Local Development

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create .env file**:
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/EasyXpense
   JWT_SECRET_KEY=your-jwt-secret-key
   SECRET_KEY=your-secret-key
   ```

4. **Run development server**:
   ```bash
   python run.py
   ```

### Production Deployment (Render)

#### Environment Variables
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/EasyXpense
JWT_SECRET_KEY=<generate-secure-key>
SECRET_KEY=<generate-secure-key>
```

#### Build Command
```bash
pip install -r requirements.txt
```

#### Start Command
```bash
gunicorn wsgi:app
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Application factory
│   ├── config.py            # Configuration
│   ├── extensions.py        # MongoDB initialization
│   │
│   ├── models/
│   │   ├── user_model.py    # User data model
│   │   ├── group_model.py   # Group data model
│   │   ├── expense_model.py # Expense data model
│   │   └── debt_model.py    # Debt calculation
│   │
│   ├── routes/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User endpoints
│   │   ├── groups.py        # Group endpoints
│   │   ├── expenses.py      # Expense endpoints
│   │   └── debts.py         # Debt endpoints
│   │
│   ├── middleware/
│   │   └── auth.py          # JWT authentication
│   │
│   └── utils/
│       └── helpers.py       # Utility functions
│
├── run.py                   # Development entry point
├── wsgi.py                  # Production entry point
├── requirements.txt         # Python dependencies
├── runtime.txt              # Python version
├── gunicorn.conf.py         # Gunicorn configuration
└── .env.example             # Environment variables template
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Health
- `GET /health` - Health check
- `GET /api/health` - Health check

### Users (Protected)
- `GET /api/users/me` - Get current user
- `GET /api/users/friends` - List friends
- `POST /api/users/friends` - Add friend

### Groups (Protected)
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group
- `DELETE /api/groups/:id` - Delete group

### Expenses (Protected)
- `GET /api/expenses` - List expenses (paginated)
- `POST /api/expenses` - Create expense
- `DELETE /api/expenses/:id` - Delete expense

### Debts (Protected)
- `GET /api/debts` - Calculate debts
- `POST /api/debts/settle` - Record settlement

## 🔐 Security Features

- JWT token authentication
- bcrypt password hashing
- Input validation and sanitization
- CORS protection
- Security headers (X-Frame-Options, X-XSS-Protection)
- User-scoped data isolation
- MongoDB connection pooling

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### Test with Gunicorn
```bash
gunicorn wsgi:app
```

## 📊 MongoDB Collections

- `users` - User accounts
- `friends` - User friends
- `groups` - Expense groups
- `expenses` - Expense records
- `settlements` - Payment settlements

## 🛠️ Troubleshooting

### MongoDB Connection Issues
- Verify MONGO_URI is correct
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)
- Ensure database user has read/write permissions

### Gunicorn Not Starting
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.11.9)
- Test with: `python run.py` first

### Token Issues
- Ensure JWT_SECRET_KEY is set
- Check token expiration (7 days default)
- Verify Authorization header format: `Bearer <token>`

## 📝 Generate Secret Keys

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 🚀 Production Checklist

- [x] Environment variables configured
- [x] MongoDB Atlas connection working
- [x] Gunicorn configuration optimized
- [x] CORS origins configured
- [x] Security headers enabled
- [x] Error handling implemented
- [x] Logging configured
- [x] Health check endpoint working

## 📄 License

Educational and portfolio purposes.
