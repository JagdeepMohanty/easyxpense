# EasyXpense - Complete Project Overview

## 🎯 Project Purpose
Modern expense splitting web application for tracking shared expenses, managing debts, and settling payments among friends and groups.

## 🏗️ Technology Stack

### Frontend Stack
- **Framework**: React 18.2.0
- **Build Tool**: Vite 4.4.0
- **Routing**: React Router DOM 6.8.0
- **HTTP Client**: Axios 1.13.5
- **Styling**: Tailwind CSS 3.4.19
- **Charts**: Recharts 2.8.0
- **Icons**: Lucide React 0.577.0
- **Deployment**: Netlify
- **Live URL**: https://easyxpense.netlify.app

### Backend Stack
- **Language**: Python 3.11
- **Framework**: Flask 3.0.3
- **CORS**: Flask-CORS 4.0.1
- **Database Driver**: PyMongo 4.8.0
- **Authentication**: PyJWT 2.9.0
- **Password Hashing**: bcrypt 4.2.0
- **Server**: Gunicorn 22.0.0
- **Environment**: python-dotenv 1.0.1
- **Deployment**: Render
- **Live URL**: https://easyxpense.onrender.com

### Database Stack
- **Database**: MongoDB Atlas (Free Tier)
- **Database Name**: EasyXpense
- **Collections**: users, friends, expenses, settlements, groups
- **Storage**: 512MB limit

## 📂 Project Structure

```
easyxpense/
├── backend/
│   ├── app/
│   │   ├── middleware/
│   │   │   └── auth.py              # JWT token verification
│   │   ├── models/
│   │   │   ├── user_model.py        # User data model
│   │   │   ├── expense_model.py     # Expense data model
│   │   │   ├── group_model.py       # Group data model
│   │   │   ├── group_transaction.py # Group transaction model
│   │   │   ├── group.py             # Group helper
│   │   │   └── debt_model.py        # Debt calculation logic
│   │   ├── routes/
│   │   │   ├── auth.py              # Authentication endpoints
│   │   │   ├── users.py             # User management
│   │   │   ├── friends.py           # Friend management
│   │   │   ├── expenses.py          # Expense CRUD
│   │   │   ├── groups.py            # Group CRUD
│   │   │   ├── debts.py             # Debt tracking
│   │   │   ├── settlements.py       # Payment settlements
│   │   │   ├── analytics.py         # Analytics & reports
│   │   │   ├── group_transactions.py # Group transactions
│   │   │   └── health.py            # Health check
│   │   ├── utils/
│   │   │   ├── helpers.py           # Utility functions
│   │   │   └── sanitize.py          # Input sanitization
│   │   ├── config.py                # App configuration
│   │   ├── extensions.py            # MongoDB connection
│   │   └── __init__.py              # Flask app factory
│   ├── wsgi.py                      # WSGI entry point
│   ├── gunicorn.conf.py             # Gunicorn config
│   ├── setup_indexes.py             # MongoDB indexes
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── routes.jsx           # Route definitions
│   │   │   └── App.jsx              # Root component
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── IncomeExpenseChart.jsx
│   │   │   │   ├── CategoryChart.jsx
│   │   │   │   └── RecentTransactions.jsx
│   │   │   ├── layout/
│   │   │   │   └── Footer.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Input.jsx
│   │   │   │   └── EmptyState.jsx
│   │   │   ├── Navbar.jsx           # Glassmorphism navbar
│   │   │   └── ProtectedRoute.jsx   # Route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state management
│   │   │   └── ThemeContext.jsx     # Theme management
│   │   ├── features/
│   │   │   ├── expenses/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── DashboardNew.jsx
│   │   │   │   └── ExpensesNew.jsx
│   │   │   ├── friends/
│   │   │   │   └── FriendsNew.jsx
│   │   │   └── groups/
│   │   │       └── GroupsNew.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx       # Main app layout
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── AddExpense.jsx       # Add expense form
│   │   │   ├── DebtTracker.jsx      # Debt tracking
│   │   │   └── PaymentHistory.jsx   # Payment history
│   │   ├── services/
│   │   │   └── api.js               # API client & endpoints
│   │   ├── utils/
│   │   │   └── currency.js          # Currency formatting
│   │   ├── index.css                # Global styles
│   │   └── main.jsx                 # Entry point
│   ├── public/
│   │   └── _redirects               # Netlify SPA routing
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── package.json                 # Node dependencies
├── render.yaml                      # Render deployment
├── netlify.toml                     # Netlify deployment
└── README.md                        # Documentation
```

## 🎨 Design System

### Color Palette
```css
Background:      #020617  (bg-main)
Card:            #0F172A  (bg-card)
Primary:         #10B981  (bg-primary)
Accent:          #34D399  (bg-accent)
Text Main:       #E2E8F0  (text-text-main)
Text Muted:      #94A3B8  (text-text-muted)
Border:          slate-800
```

### UI Components
- **Cards**: `bg-card rounded-xl shadow-lg p-6`
- **Buttons**: `bg-primary hover:bg-accent h-11 rounded-lg`
- **Inputs**: `h-11 px-4 rounded-lg border-slate-700`
- **Navbar**: Glassmorphism with `backdrop-blur-md bg-[#0F172A]/60`

### Typography
- **Headings**: `text-2xl font-semibold text-text-main`
- **Body**: `text-sm text-text-muted`
- **Font**: Inter (Google Fonts)

### Icons
- **Library**: Lucide React
- **Size**: 18-24px
- **Color**: Contextual (primary, muted, red)


## 🛣️ Frontend Routes

### Public Routes (Unauthenticated)
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home.jsx | Landing page with features |
| `/login` | Login.jsx | User login (split screen design) |
| `/register` | Register.jsx | User registration (split screen design) |

### Protected Routes (Authenticated)
| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | DashboardNew.jsx | Main dashboard with stats & charts |
| `/expenses` | ExpensesNew.jsx | Expense list view |
| `/expenses/add` | AddExpense.jsx | Add new expense form |
| `/friends` | FriendsNew.jsx | Friend management |
| `/groups` | GroupsNew.jsx | Group management |
| `/debts` | DebtTracker.jsx | Debt tracking & settlement |
| `/payments` | PaymentHistory.jsx | Payment history table |

### Route Guards
- **ProtectedRoute**: Redirects to `/login` if not authenticated
- **Auth Check**: Redirects to `/dashboard` if already authenticated
- **404 Handler**: Redirects to `/` for unknown routes

## 🔌 Backend API Endpoints

### Authentication (Public)
```
POST /api/auth/register
Body: { name, email, password }
Response: { token, user }

POST /api/auth/login
Body: { email, password }
Response: { token, user }

POST /api/auth/logout
Response: { message }
```

### Health Check (Public)
```
GET /health
GET /api/health
Response: { status, database }
```

### Friends (Protected)
```
GET /api/friends?page=1&limit=10&search=
Response: { data, total, page, totalPages }

POST /api/friends
Body: { name, phone }
Response: { id, message }

PUT /api/friends/:id
Body: { name, phone }
Response: { message }

DELETE /api/friends/:id
Response: { message }
```

### Expenses (Protected)
```
GET /api/expenses?page=1&limit=10
Response: { data, total, page, totalPages }

POST /api/expenses
Body: { amount, description, category, date, friends }
Response: { id, message }

DELETE /api/expenses/:id
Response: { message }
```

### Groups (Protected)
```
GET /api/groups
Response: { groups }

POST /api/groups
Body: { name, members }
Response: { id, message }

GET /api/groups/:id
Response: { group }

DELETE /api/groups/:id
Response: { message }
```

### Debts (Protected)
```
GET /api/debts?group_id=
Response: { debts }

POST /api/debts/settle
Body: { fromUser, toUser, amount }
Response: { id, message }
```

### Settlements (Protected)
```
GET /api/settlements
Response: { settlements }

GET /api/settlements/history?page=1&limit=10&search=
Response: { settlements }

POST /api/settlements
Body: { fromUser, toUser, amount }
Response: { id, message }
```

### Analytics (Protected)
```
GET /api/analytics/monthly?months=6
Response: { data: [{ month, amount }] }

GET /api/analytics/categories
Response: { data: [{ name, value }] }
```

### Users (Protected)
```
GET /api/users/me
Response: { user }

GET /api/users/friends
Response: { friends }

POST /api/users/friends
Body: { name }
Response: { id, message }
```

## 🔐 Authentication Flow

### Registration
1. User submits name, email, password
2. Backend validates input (email format, password length ≥6)
3. Backend checks if user exists (409 if duplicate)
4. Password hashed with bcrypt (salt rounds)
5. User document created in MongoDB
6. JWT token generated (7 day expiry)
7. Token + user data returned
8. Frontend stores token in localStorage
9. Redirect to `/dashboard`

### Login
1. User submits email, password
2. Backend validates input
3. Backend finds user by email
4. Password verified with bcrypt.checkpw()
5. JWT token generated (7 day expiry)
6. Token + user data returned
7. Frontend stores token in localStorage
8. Redirect to `/dashboard`

### Token Management
- **Storage**: localStorage (key: 'token', 'user')
- **Header**: `Authorization: Bearer <token>`
- **Expiry**: 7 days
- **Refresh**: Manual re-login required
- **Logout**: Token removed from localStorage

### Protected Routes
- Middleware checks `Authorization` header
- JWT decoded and verified
- `user_id` extracted from payload
- Request continues with `request.user_id`
- 401 error if token invalid/expired

## 💾 Database Schema

### users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  phone: String (optional),
  password: Binary (bcrypt hash),
  created_at: DateTime
}
```

### friends Collection
```javascript
{
  _id: ObjectId,
  user_id: String (indexed),
  name: String,
  phone: String (optional),
  created_at: DateTime,
  updated_at: DateTime
}
```

### expenses Collection
```javascript
{
  _id: ObjectId,
  user_id: String (indexed),
  amount: Number,
  description: String,
  category: String,
  date: DateTime (indexed),
  friends: Array<String>,
  splits: Array<Object>,
  created_at: DateTime
}
```

### groups Collection
```javascript
{
  _id: ObjectId,
  user_id: String (indexed),
  name: String,
  members: Array<String>,
  group_code: String (6 chars),
  created_at: DateTime
}
```

### settlements Collection
```javascript
{
  _id: ObjectId,
  user_id: String (indexed),
  fromUser: String,
  toUser: String,
  amount: Number,
  created_at: DateTime
}
```

### Indexes
- users: email (unique)
- friends: user_id
- expenses: user_id, date
- groups: user_id
- settlements: user_id


## ✨ Core Features & Functionality

### 1. Dashboard (Main Page)
**Location**: `/dashboard`
**Component**: `DashboardNew.jsx`

**Features**:
- **4 Stat Cards**: Total Balance, Total Income, Total Expenses, Savings
- **Income vs Expense Chart**: Dual bar chart (6 months data)
- **Category Breakdown**: Donut chart with spending categories
- **Recent Transactions**: Table with last 10 transactions
- **Loading States**: Skeleton loaders for all sections
- **Empty States**: Helpful messages when no data

**Data Sources**:
- GET /api/analytics/monthly (6 months)
- GET /api/analytics/categories
- GET /api/expenses?limit=10

**Calculations**:
- Total Balance = Total Income - Total Expenses
- Total Income = sum(type === "income")
- Total Expenses = sum(type === "expense")
- Savings = Total Balance

### 2. Expense Management
**Location**: `/expenses`, `/expenses/add`
**Components**: `ExpensesNew.jsx`, `AddExpense.jsx`

**Features**:
- **List View**: All expenses with date, description, category, amount
- **Add Expense**: Form with description, amount, category, date, paidBy
- **Split Options**: Equal, Percentage, Exact amount
- **Friend Selection**: Multi-select friends to split with
- **Split Preview**: Real-time calculation display
- **Categories**: Food, Transport, Entertainment, Shopping, Bills, Healthcare, Other
- **Validation**: Amount > 0, split totals match amount

**Data Flow**:
1. User fills expense form
2. Selects friends to split with
3. Chooses split type (equal/percentage/exact)
4. Preview shows per-person amounts
5. Submit creates expense record
6. Expense appears in list and dashboard

### 3. Friend Management
**Location**: `/friends`
**Component**: `FriendsNew.jsx`

**Features**:
- **Add Friend**: Name + phone number (optional)
- **Friend List**: Grid view with avatar, name, phone
- **Edit Friend**: Update name/phone
- **Delete Friend**: Confirmation modal
- **Search**: Filter friends by name
- **Pagination**: 10 friends per page
- **Empty State**: Prompt to add first friend

**Validation**:
- Name required
- Phone format validation (Indian: 10 digits starting 6-9)
- Duplicate check by name

### 4. Group Management
**Location**: `/groups`
**Component**: `GroupsNew.jsx`

**Features**:
- **Create Group**: Name + member list
- **Add Members**: Type names and add to list
- **Group Code**: Auto-generated 6-character code
- **Group List**: Card view with member count
- **Edit Group**: Update name/members
- **Delete Group**: Confirmation modal
- **Empty State**: Prompt to create first group

**Use Cases**:
- Trip expenses with multiple friends
- Shared household expenses
- Event/party cost splitting

### 5. Debt Tracking
**Location**: `/debts`
**Component**: `DebtTracker.jsx`

**Features**:
- **Active Debts**: List of who owes whom
- **Debt Calculation**: Optimized debt simplification
- **Settle Debt**: Record partial/full payment
- **Settlement Amount**: Custom amount input
- **Summary Cards**: Pending settlements, total amount
- **Visual Indicators**: Arrows showing debt direction
- **Empty State**: "All settled up!" message

**Debt Logic**:
1. Calculate shares from expenses
2. Subtract settlements
3. Optimize debt graph (minimize transactions)
4. Display simplified debts

### 6. Payment History
**Location**: `/payments`
**Component**: `PaymentHistory.jsx`

**Features**:
- **Settlement Table**: Date, From, To, Amount
- **Search**: Filter by user name
- **Date Formatting**: "Jan 15, 2024" format
- **User Avatars**: Colored circles with initials
- **Empty State**: "No payment history" message
- **Responsive**: Scrollable on mobile

**Data Source**: GET /api/settlements/history

### 7. Authentication System
**Location**: `/login`, `/register`
**Components**: `Login.jsx`, `Register.jsx`

**Design**: Split-screen layout
- **Left Panel**: Branding + 3 feature highlights
- **Right Panel**: Auth form

**Login Features**:
- Email + password
- Form validation
- Error messages
- Loading state
- "Remember me" via localStorage

**Register Features**:
- Name, email, password, confirm password
- Password strength: min 6 characters
- Password match validation
- Duplicate email check
- Auto-login after registration

### 8. Navigation System
**Component**: `Navbar.jsx`

**Design**: Glassmorphism sticky navbar
- **Left**: EasyXpense logo (clickable → dashboard)
- **Center**: 5 icon buttons (Dashboard, Expenses, Friends, Groups, History)
- **Right**: Theme toggle + user profile dropdown

**Features**:
- **Sticky**: Always visible at top
- **Active State**: Highlighted current page
- **Tooltips**: Hover to see page names
- **Profile Menu**: User info + logout
- **Responsive**: Icons remain visible on mobile
- **Glassmorphism**: `backdrop-blur-md bg-[#0F172A]/60`

### 9. Theme System
**Context**: `ThemeContext.jsx`

**Features**:
- Dark theme (default)
- Light theme (placeholder)
- Toggle button in navbar
- Persistent preference (localStorage)
- Consistent color tokens

**Current State**: Dark theme only (light theme UI exists but not fully implemented)

## 🔒 Security Features

### Input Validation
- **Email**: Regex pattern validation
- **Phone**: Indian format (10 digits, starts 6-9)
- **Password**: Min 6 characters
- **Amount**: Positive numbers only
- **String Length**: Max 1000 characters

### Input Sanitization
- Strip whitespace
- Recursive sanitization for nested objects
- XSS prevention

### Authentication Security
- **Password Hashing**: bcrypt with auto-generated salt
- **JWT Tokens**: HS256 algorithm, 7-day expiry
- **Token Storage**: localStorage (client-side)
- **Protected Routes**: Middleware verification
- **User Isolation**: All queries filtered by user_id

### CORS Protection
- Allowed origins: Netlify, localhost
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

### Database Security
- User-scoped queries (user_id filter)
- Unique email constraint
- Indexed queries for performance
- Connection pooling

## ⚡ Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading with React.lazy()
- **Route-based Splitting**: Each page is a separate chunk
- **Component Memoization**: React.memo() for expensive components
- **Vite Bundling**: Fast HMR, optimized production builds
- **Asset Optimization**: Minified CSS/JS, tree-shaking
- **CDN Delivery**: Netlify CDN for static assets

### Backend
- **MongoDB Indexing**: All query fields indexed
- **Connection Pooling**: Reuse database connections
- **Gunicorn Workers**: Multiple worker processes
- **Query Optimization**: Projection, limit, skip
- **Aggregation Pipeline**: Efficient data processing

### Database
- **Indexes**: user_id, email, date fields
- **Compound Indexes**: Multi-field queries
- **Query Projection**: Return only needed fields
- **Pagination**: Limit results per page

### Caching Strategy
- **Frontend**: Browser cache for static assets
- **Backend**: No caching (real-time data)
- **Database**: MongoDB internal caching

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: 1024px+ (lg)
- **Wide**: 1280px+ (xl)

### Layout Adaptations
- **Dashboard Stats**: 4 cols → 2 cols → 1 col
- **Charts**: Side-by-side → stacked
- **Tables**: Scrollable on mobile
- **Navbar**: Icons always visible (no hamburger)
- **Forms**: Full width on mobile
- **Cards**: Grid → stack

### Mobile Optimizations
- Touch-friendly buttons (min 44px)
- Larger tap targets
- Simplified navigation
- Reduced content density
- Optimized images

## 🚀 Deployment Architecture

### Frontend (Netlify)
- **Build**: `npm run build` (Vite)
- **Output**: `dist/` directory
- **Routing**: SPA with `_redirects` file
- **Environment**: VITE_API_URL
- **CDN**: Global edge network
- **SSL**: Auto-provisioned HTTPS

### Backend (Render)
- **Build**: `pip install -r requirements.txt`
- **Start**: `gunicorn wsgi:app -c gunicorn.conf.py`
- **Workers**: 2 (configurable)
- **Environment**: MONGO_URI, JWT_SECRET_KEY, FLASK_ENV, PORT
- **Health Check**: /health endpoint
- **Auto-deploy**: Git push triggers rebuild

### Database (MongoDB Atlas)
- **Tier**: Free (M0)
- **Region**: Closest to backend
- **Network**: IP whitelist (0.0.0.0/0)
- **Backup**: Automatic snapshots
- **Monitoring**: Atlas dashboard

## 🧪 Testing Strategy

### Manual Testing
- Registration flow
- Login flow
- Add expense
- Add friend
- Create group
- Settle debt
- View analytics

### API Testing
- Postman/Thunder Client
- Health check endpoint
- Auth endpoints
- CRUD operations
- Error responses

### Browser Testing
- Chrome (primary)
- Firefox
- Safari
- Mobile browsers

## 📊 Analytics & Monitoring

### Frontend Monitoring
- Build success/failure
- Bundle size tracking
- Lighthouse scores
- Error tracking (console)

### Backend Monitoring
- Health check endpoint
- Response times
- Error logs
- Database connection status

### Database Monitoring
- Query performance
- Index usage
- Storage usage
- Connection pool

## 🔄 Data Flow Examples

### Add Expense Flow
1. User navigates to `/expenses/add`
2. Fills form: description, amount, category, date
3. Selects friends from list
4. Chooses split type (equal/percentage/exact)
5. Preview shows calculated splits
6. Submits form
7. Frontend: POST /api/expenses with data
8. Backend: Validates input, sanitizes data
9. Backend: Creates expense document with user_id
10. Backend: Returns success response
11. Frontend: Redirects to `/expenses`
12. Expense appears in list

### Debt Settlement Flow
1. User navigates to `/debts`
2. Backend: GET /api/debts
3. Backend: Calculates debts from expenses & settlements
4. Frontend: Displays active debts
5. User clicks "Settle" on a debt
6. Enters settlement amount
7. Confirms settlement
8. Frontend: POST /api/debts/settle
9. Backend: Creates settlement record
10. Backend: Recalculates debts
11. Frontend: Refreshes debt list
12. Updated debts displayed

### Dashboard Load Flow
1. User navigates to `/dashboard`
2. Frontend: Shows skeleton loaders
3. Frontend: Parallel API calls:
   - GET /api/analytics/monthly
   - GET /api/analytics/categories
   - GET /api/expenses?limit=10
4. Backend: Queries MongoDB for each endpoint
5. Backend: Aggregates data, returns JSON
6. Frontend: Processes responses
7. Frontend: Calculates stats (balance, income, expenses)
8. Frontend: Renders charts with Recharts
9. Frontend: Displays recent transactions
10. Loading complete

## 🎯 Future Enhancements (Not Implemented)

- Real-time notifications
- Email reminders for debts
- Receipt image upload
- Export to CSV/PDF
- Multi-currency support
- Recurring expenses
- Budget tracking
- Mobile app (React Native)
- Social sharing
- Group chat
- Payment gateway integration
- Advanced analytics (trends, predictions)
- Dark/Light theme toggle (full implementation)

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
