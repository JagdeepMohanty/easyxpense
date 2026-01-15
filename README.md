# EasyXpense - Expense Splitting Application

A modern, no-authentication expense splitting application built with React.js frontend and Python Flask backend, designed for Indian Rupee (INR) transactions.

## 🌐 Live Application

- **Frontend:** https://easyxpense.netlify.app
- **Backend API:** https://easyxpense.onrender.com
- **Test Page:** https://easyxpense.netlify.app/test

## 🌟 Features

- 💰 **Expense Splitting** - Easily split expenses among friends
- 📊 **Debt Tracking** - See who owes what and how much
- 💳 **Payment Settlements** - Track and settle outstanding debts
- 📱 **Payment History** - Complete log of expenses and settlements
- 🇮🇳 **INR Currency** - Native Indian Rupee support with proper formatting
- 🚫 **No Authentication** - Direct access without login/registration
- 📱 **Responsive Design** - Works perfectly on mobile and desktop

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
- Gunicorn 21.2.0
- Deployed on Render

### Database
- MongoDB Atlas
- Database: `easyxpense_db`
- Collections: `friends`, `expenses`, `settlements`

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+
- MongoDB Atlas account

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your MongoDB URI:
   ```
   MONGO_URI=mongodb+srv://easyXpense:Jagdeep2607@easyxpense.uafnhae.mongodb.net/easyxpense_db?retryWrites=true&w=majority
   FLASK_ENV=development
   PORT=5000
   ```

5. **Start backend:**
   ```bash
   python run.py
   ```
   Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_NAME=EasyXpense
   REACT_APP_VERSION=1.0.0
   ```

4. **Start frontend:**
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:3000`

## 🌐 Production Deployment

### Render Backend Deployment

1. **Connect GitHub repository to Render**
2. **Configure build settings:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - Root Directory: `backend`

3. **Set environment variables:**
   ```
   MONGO_URI=mongodb+srv://easyXpense:Jagdeep2607@easyxpense.uafnhae.mongodb.net/easyxpense_db?retryWrites=true&w=majority
   FLASK_ENV=production
   PORT=10000
   ```

### Netlify Frontend Deployment

1. **Connect GitHub repository to Netlify**
2. **Configure build settings:**
   - Base Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `frontend/build`

3. **Set environment variables:**
   ```
   REACT_APP_API_URL=https://easyxpense.onrender.com
   REACT_APP_NAME=EasyXpense
   REACT_APP_VERSION=1.0.0
   ```

### MongoDB Atlas Configuration

1. **Network Access:**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)

2. **Database Access:**
   - Username: `easyXpense`
   - Password: `Jagdeep2607`
   - Role: Read and write to any database

3. **Database:**
   - Name: `easyxpense_db`
   - Collections are auto-created on first insert

## 📱 Application Pages

### 🏠 Home
- Welcome page with feature overview
- How it works section
- Quick access to main features

### 📊 Dashboard
- Expense summary and statistics
- Recent expenses overview
- Debt summary with friends
- Quick action buttons

### 💰 Add Expense
- Create new shared expenses
- Select payer and participants
- Automatic split calculation
- INR amount validation

### 👥 Friends
- Add new friends by name and email
- View all friends list
- Friend management

### 📈 Debt Tracker
- Complete debt overview
- See who owes what
- Settle debts functionality
- Net balance calculations

### 📋 Payment History
- All expenses history
- Settlement records
- Filterable by type
- Date-wise organization

## 🛠️ API Endpoints

### Health & Status
- `GET /` - Backend status
- `GET /health` - Health check
- `GET /api/test` - API connectivity test

### Friends
- `GET /api/friends` - Get all friends
- `POST /api/friends` - Add new friend
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
  ```json
  {
    "description": "Dinner",
    "amount": 1000,
    "payer": "John Doe",
    "participants": ["John Doe", "Jane Smith"]
  }
  ```

### Debts
- `GET /api/debts` - Get debt summary
  ```json
  [
    {
      "debtor": "Jane Smith",
      "creditor": "John Doe",
      "amount": 500
    }
  ]
  ```

### Settlements
- `GET /api/settlements` - Get settlement history
- `POST /api/settlements` - Create new settlement
  ```json
  {
    "fromUser": "Jane Smith",
    "toUser": "John Doe",
    "amount": 500
  }
  ```

## 🧪 Testing

### Backend API Tests

```bash
# Test health
curl https://easyxpense.onrender.com/health

# Test API
curl https://easyxpense.onrender.com/api/test

# Add friend
curl -X POST https://easyxpense.onrender.com/api/friends \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Get friends
curl https://easyxpense.onrender.com/api/friends
```

### Frontend Test Page

Visit: https://easyxpense.netlify.app/test

Click "Run Connection Tests" to verify all endpoints.

### Automated Testing

**Windows:**
```bash
test_api.bat
```

**Linux/Mac:**
```bash
chmod +x test_api.sh
./test_api.sh
```

**Python Verification:**
```bash
cd backend
python verify_deployment.py
```

## 💰 Currency Features

- **INR Formatting:** Proper Indian Rupee display with ₹ symbol
- **Decimal Precision:** Accurate to paise (0.01 INR)
- **Input Validation:** Prevents invalid amounts
- **Split Calculations:** Automatic per-person amount calculation
- **Indian Number Format:** Uses en-IN locale formatting

## 🔧 Environment Variables

See `ENVIRONMENT_VARIABLES.md` for complete configuration guide.

### Required Backend Variables
```
MONGO_URI - MongoDB Atlas connection string
FLASK_ENV - Environment (production/development)
PORT - Server port (default: 10000)
```

### Required Frontend Variables
```
REACT_APP_API_URL - Backend API URL
REACT_APP_NAME - Application name
REACT_APP_VERSION - Application version
```

## 📁 Project Structure

```
easyxpense/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── expense.py
│   │   ├── routes/
│   │   │   ├── expenses.py
│   │   │   ├── friends.py
│   │   │   ├── debts.py
│   │   │   ├── settlements.py
│   │   │   └── health.py
│   │   └── __init__.py
│   ├── run.py
│   ├── wsgi.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   │   ├── _redirects
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddExpense.jsx
│   │   │   ├── Friends.jsx
│   │   │   ├── DebtTracker.jsx
│   │   │   ├── PaymentHistory.jsx
│   │   │   └── TestConnection.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── currency.js
│   │   ├── styles/
│   │   │   └── App.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── netlify.toml
├── render.yaml
├── README.md
└── ENVIRONMENT_VARIABLES.md
```

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Check MONGO_URI is set correctly
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database credentials

**Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Frontend Issues

**Network Error:**
- Verify backend is running
- Check REACT_APP_API_URL is correct
- Check browser console for CORS errors

**Build Errors:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 License

This project is for educational and portfolio purposes.

## 👨‍💻 Author

Jagdeep Mohanty

## 🙏 Acknowledgments

- Built with React, Flask, and MongoDB
- Deployed on Netlify and Render
- Designed for Indian Rupee transactions

---

**Made with ❤️ for expense splitting in India** 🇮🇳
