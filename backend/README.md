# EasyXpense Backend

Flask API for EasyXpense expense splitting application.

## Production Deployment

**Platform**: Render  
**Database**: MongoDB Atlas  
**Authentication**: JWT (24h access + 7d refresh tokens)

## Environment Variables

```bash
FLASK_ENV=production
JWT_SECRET_KEY=<generate-secure-key>
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://easyxpense.netlify.app
PORT=10000
GUNICORN_WORKERS=2
```

## Local Development

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## Structure

```
backend/
├── app/
│   ├── config.py       # Environment configs
│   ├── __init__.py     # App factory
│   ├── middleware/     # Auth middleware
│   ├── models/         # Data models
│   ├── routes/         # API endpoints
│   └── utils/          # Utilities
├── wsgi.py             # Production entry
├── run.py              # Development entry
└── requirements.txt    # Dependencies
```

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/friends` - List friends
- `POST /api/expenses` - Create expense
- `GET /api/debts` - Get debt settlements
- `GET /health` - Health check

All endpoints except auth and health require JWT authentication.
