# Production Codebase - Quick Reference

## 📁 Project Structure (Cleaned)

### Root Level
```
easyxpense/
├── backend/                 # Flask API
├── frontend/                # React app
├── .gitignore              # Git ignore rules
├── netlify.toml            # Frontend deployment
├── render.yaml             # Backend deployment
└── README.md               # Main documentation
```

### Documentation Files
```
├── README.md                        # Project overview & setup
├── DEPLOYMENT.md                    # Deployment instructions
├── PRODUCTION_READY.md              # Production checklist
├── DESIGN_SYSTEM_REFERENCE.md       # UI/UX guidelines
├── PREMIUM_POLISH_SUMMARY.md        # Latest UI improvements
├── POLISH_CHANGES.md                # Recent changes log
└── PRODUCTION_CLEANUP_REPORT.md     # This cleanup report
```

### Frontend Structure
```
frontend/
├── public/
│   ├── _redirects          # Netlify SPA routing
│   ├── favicon.ico         # App icon
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx      # Button component
│   │   │   ├── Card.jsx        # Card component
│   │   │   ├── Input.jsx       # Input component
│   │   │   └── StatCard.jsx    # Stat card component
│   │   ├── Footer.jsx          # Footer component
│   │   └── Navbar.jsx          # Navigation bar
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── AddExpense.jsx      # Add expense form
│   │   ├── Friends.jsx         # Friends management
│   │   ├── DebtTracker.jsx     # Debt tracking
│   │   └── PaymentHistory.jsx  # Transaction history
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── styles/
│   │   └── App.css             # Main stylesheet (ONLY ONE)
│   ├── utils/
│   │   └── currency.js         # Currency utilities
│   ├── App.jsx                 # Main app component
│   └── index.js                # Entry point
├── .env.example                # Environment template
├── package.json                # Dependencies
└── package-lock.json           # Locked dependencies
```

### Backend Structure
```
backend/
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── expense.py          # Expense model
│   │   └── group.py            # Group model
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── debts.py            # Debt endpoints
│   │   ├── expenses.py         # Expense endpoints
│   │   ├── friends.py          # Friends endpoints
│   │   ├── groups.py           # Groups endpoints
│   │   ├── health.py           # Health check
│   │   └── settlements.py      # Settlement endpoints
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── debt_optimizer.py   # Debt optimization
│   │   ├── money.py            # Money utilities
│   │   └── sanitize.py         # Input sanitization
│   └── __init__.py             # Flask app factory
├── .env.example                # Environment template
├── gunicorn.conf.py            # Gunicorn config
├── requirements.txt            # Python dependencies
├── run.py                      # Development server
└── wsgi.py                     # Production WSGI
```

## 🎯 Key Files by Purpose

### Development
- `frontend/package.json` - Frontend dependencies
- `backend/requirements.txt` - Backend dependencies
- `backend/run.py` - Local development server
- `.env.example` - Environment variable template

### Production
- `netlify.toml` - Frontend deployment config
- `render.yaml` - Backend deployment config
- `backend/wsgi.py` - Production WSGI entry
- `backend/gunicorn.conf.py` - Gunicorn settings

### Styling
- `frontend/src/styles/App.css` - **ONLY stylesheet** (modern.css removed)

### Documentation
- `README.md` - Start here
- `DEPLOYMENT.md` - How to deploy
- `DESIGN_SYSTEM_REFERENCE.md` - UI guidelines
- `PRODUCTION_CLEANUP_REPORT.md` - Cleanup details

## 🚀 Quick Commands

### Frontend
```bash
cd frontend
npm install              # Install dependencies
npm start               # Development server
npm run build           # Production build
```

### Backend
```bash
cd backend
python -m venv venv     # Create virtual environment
venv\Scripts\activate   # Activate (Windows)
pip install -r requirements.txt
python run.py           # Development server
```

## 📝 Important Notes

### CSS Files
- ✅ **Use**: `App.css` (active stylesheet)
- ❌ **Removed**: `modern.css` (duplicate)

### Console Logs
- Development logs are environment-gated
- Error logs kept for debugging
- No production performance impact

### Documentation
- Keep only current, relevant docs
- Remove outdated iteration docs
- Update README for major changes

### Code Organization
- All components are used
- All routes are active
- No dead code
- Clean imports

## 🔍 Finding Things

### Need to modify styles?
→ `frontend/src/styles/App.css`

### Need to add a new page?
1. Create in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add nav link in `frontend/src/components/Navbar.jsx`

### Need to add API endpoint?
1. Create route in `backend/app/routes/`
2. Register in `backend/app/__init__.py`
3. Add to `frontend/src/services/api.js`

### Need to modify UI component?
→ `frontend/src/components/ui/`

## ✅ Verification

### Check if build works:
```bash
cd frontend
npm run build
```

### Check if backend starts:
```bash
cd backend
python run.py
```

### Check if all routes work:
- Visit http://localhost:3000
- Navigate to all pages
- Verify no console errors

---

**Last Updated**: Production Cleanup  
**Status**: ✅ Clean & Production Ready
