# EasyXpense Backend - Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                  (React + Vite + Netlify)                    │
│                  https://easyxpense.netlify.app              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS + JWT Token
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    RENDER (Cloud)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              GUNICORN (WSGI Server)                  │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │         FLASK APPLICATION                      │ │   │
│  │  │                                                │ │   │
│  │  │  ┌──────────────────────────────────────────┐ │ │   │
│  │  │  │        Application Factory              │ │ │   │
│  │  │  │         (app/__init__.py)               │ │ │   │
│  │  │  └──────────────────────────────────────────┘ │ │   │
│  │  │                                                │ │   │
│  │  │  ┌──────────────────────────────────────────┐ │ │   │
│  │  │  │         Middleware Layer                │ │ │   │
│  │  │  │  - JWT Authentication                   │ │ │   │
│  │  │  │  - Security Headers                     │ │ │   │
│  │  │  │  - CORS                                 │ │ │   │
│  │  │  └──────────────────────────────────────────┘ │ │   │
│  │  │                                                │ │   │
│  │  │  ┌──────────────────────────────────────────┐ │ │   │
│  │  │  │         Routes (Blueprints)             │ │ │   │
│  │  │  │  - /api/auth    (Public)                │ │ │   │
│  │  │  │  - /api/users   (Protected)             │ │ │   │
│  │  │  │  - /api/groups  (Protected)             │ │ │   │
│  │  │  │  - /api/expenses (Protected)            │ │ │   │
│  │  │  │  - /api/debts   (Protected)             │ │ │   │
│  │  │  └──────────────────────────────────────────┘ │ │   │
│  │  │                                                │ │   │
│  │  │  ┌──────────────────────────────────────────┐ │ │   │
│  │  │  │         Business Logic                  │ │ │   │
│  │  │  │  - User Models                          │ │ │   │
│  │  │  │  - Group Models                         │ │ │   │
│  │  │  │  - Expense Models                       │ │ │   │
│  │  │  │  - Debt Calculation                     │ │ │   │
│  │  │  └──────────────────────────────────────────┘ │ │   │
│  │  │                                                │ │   │
│  │  │  ┌──────────────────────────────────────────┐ │ │   │
│  │  │  │         Utilities                       │ │ │   │
│  │  │  │  - Input Validation                     │ │ │   │
│  │  │  │  - Input Sanitization                   │ │ │   │
│  │  │  │  - Helper Functions                     │ │ │   │
│  │  │  └──────────────────────────────────────────┘ │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ PyMongo Driver
                         │ Connection Pool (50 max)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   MONGODB ATLAS                              │
│                    (Cloud Database)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database: EasyXpense                                │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │  Collections:                                  │ │   │
│  │  │  - users       (User accounts)                 │ │   │
│  │  │  - friends     (User friends)                  │ │   │
│  │  │  - groups      (Expense groups)                │ │   │
│  │  │  - expenses    (Expense records)               │ │   │
│  │  │  - settlements (Payment settlements)           │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### 1. Public Endpoint (Login/Register)

```
Frontend → Render → Gunicorn → Flask → Route Handler
                                          ↓
                                    Validate Input
                                          ↓
                                    Hash Password (bcrypt)
                                          ↓
                                    MongoDB Query
                                          ↓
                                    Generate JWT Token
                                          ↓
Frontend ← Render ← Gunicorn ← Flask ← Response (Token + User)
```

### 2. Protected Endpoint (Get Expenses)

```
Frontend → Render → Gunicorn → Flask → JWT Middleware
                                          ↓
                                    Validate Token
                                          ↓
                                    Extract user_id
                                          ↓
                                    Route Handler
                                          ↓
                                    MongoDB Query (user-scoped)
                                          ↓
Frontend ← Render ← Gunicorn ← Flask ← Response (Data)
```

---

## 📦 Module Architecture

```
app/
│
├── __init__.py                 # Application Factory
│   └── create_app()            # Creates and configures Flask app
│       ├── Load Config
│       ├── Initialize CORS
│       ├── Initialize MongoDB
│       ├── Register Blueprints
│       └── Add Error Handlers
│
├── config.py                   # Configuration
│   └── Config                  # Environment-based config
│       ├── SECRET_KEY
│       ├── JWT_SECRET_KEY
│       └── MONGO_URI
│
├── extensions.py               # Extensions
│   └── init_db()               # MongoDB initialization
│       ├── Create MongoClient
│       ├── Connection Pooling
│       └── Ping Test
│
├── middleware/
│   └── auth.py                 # Authentication
│       └── @token_required     # JWT validation decorator
│           ├── Extract Token
│           ├── Decode JWT
│           ├── Validate
│           └── Set user_id
│
├── models/                     # Data Models
│   ├── user_model.py           # User structure
│   │   ├── create()            # Create user document
│   │   └── to_dict()           # Convert to safe dict
│   │
│   ├── group_model.py          # Group structure
│   │   ├── generate_code()     # Generate group code
│   │   ├── create()            # Create group document
│   │   └── to_dict()           # Convert to dict
│   │
│   ├── expense_model.py        # Expense structure
│   │   ├── create()            # Create expense document
│   │   └── to_dict()           # Convert to dict
│   │
│   └── debt_model.py           # Debt calculation
│       └── calculate_debts()   # Calculate debt matrix
│
├── routes/                     # API Endpoints
│   ├── auth.py                 # Authentication routes
│   │   ├── POST /login
│   │   ├── POST /register
│   │   └── POST /logout
│   │
│   ├── users.py                # User routes
│   │   ├── GET /me
│   │   ├── GET /friends
│   │   └── POST /friends
│   │
│   ├── groups.py               # Group routes
│   │   ├── GET /
│   │   ├── POST /
│   │   ├── GET /:id
│   │   └── DELETE /:id
│   │
│   ├── expenses.py             # Expense routes
│   │   ├── GET /
│   │   ├── POST /
│   │   └── DELETE /:id
│   │
│   └── debts.py                # Debt routes
│       ├── GET /
│       └── POST /settle
│
└── utils/
    └── helpers.py              # Utility functions
        ├── sanitize_input()    # Input sanitization
        ├── validate_email()    # Email validation
        ├── validate_phone()    # Phone validation
        ├── paisa_to_rupees()   # Currency conversion
        └── rupees_to_paisa()   # Currency conversion
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: Transport Security
├── HTTPS (Render automatic)
├── TLS 1.2+
└── Secure headers

Layer 2: Authentication
├── JWT tokens (HS256)
├── 7-day expiration
├── Bearer token format
└── Secure secret from env

Layer 3: Authorization
├── @token_required decorator
├── User-scoped queries
├── No cross-user access
└── Proper error messages

Layer 4: Input Security
├── Input validation
├── Input sanitization
├── Length limits
├── Type checking
└── Format validation

Layer 5: Data Security
├── bcrypt password hashing
├── Salt rounds
├── No plaintext passwords
└── Secure comparison

Layer 6: Network Security
├── CORS restrictions
├── Allowed origins only
├── Allowed methods
└── Allowed headers

Layer 7: Application Security
├── Security headers
├── X-Frame-Options: DENY
├── X-XSS-Protection
└── X-Content-Type-Options
```

---

## 🗄️ Database Schema

```
MongoDB Atlas: EasyXpense
│
├── users
│   ├── _id: ObjectId
│   ├── name: String
│   ├── email: String (optional, unique)
│   ├── phone: String (optional, unique)
│   ├── password: Binary (bcrypt hash)
│   └── created_at: DateTime
│
├── friends
│   ├── _id: ObjectId
│   ├── user_id: String (indexed)
│   ├── name: String
│   └── created_at: DateTime
│
├── groups
│   ├── _id: ObjectId
│   ├── user_id: String (indexed)
│   ├── name: String
│   ├── members: Array[String]
│   ├── group_code: String (unique)
│   └── created_at: DateTime
│
├── expenses
│   ├── _id: ObjectId
│   ├── user_id: String (indexed)
│   ├── amount: Float
│   ├── description: String
│   ├── category: String
│   ├── friends: Array[String]
│   ├── date: DateTime
│   └── created_at: DateTime
│
└── settlements
    ├── _id: ObjectId
    ├── user_id: String (indexed)
    ├── fromUser: String
    ├── toUser: String
    ├── amount: Float
    └── created_at: DateTime
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         GitHub                               │
│                    (Source Control)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ Git Push
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Render Platform                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Build Process                                       │   │
│  │  1. Clone repository                                 │   │
│  │  2. Navigate to backend/                             │   │
│  │  3. pip install -r requirements.txt                  │   │
│  │  4. Verify Python 3.11.9 (runtime.txt)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Runtime Environment                                 │   │
│  │  - Python 3.11.9                                     │   │
│  │  - Gunicorn 22.0.0                                   │   │
│  │  - Workers: CPU * 2 + 1                              │   │
│  │  - Port: Dynamic (from env)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Environment Variables                               │   │
│  │  - MONGO_URI                                         │   │
│  │  - JWT_SECRET_KEY                                    │   │
│  │  - SECRET_KEY                                        │   │
│  │  - PORT (auto-set by Render)                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Health Checks                                       │   │
│  │  - Endpoint: /health                                 │   │
│  │  - Interval: 30s                                     │   │
│  │  - Timeout: 10s                                      │   │
│  │  - Auto-restart on failure                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Architecture

```
Connection Pooling
├── Min Pool Size: 10
├── Max Pool Size: 50
├── Connection Timeout: 10s
├── Server Selection Timeout: 5s
└── Max Idle Time: 30s

Gunicorn Workers
├── Worker Count: CPU * 2 + 1
├── Worker Class: sync
├── Worker Connections: 1000
├── Timeout: 30s
└── Keepalive: 2s

Request Processing
├── Input Validation
├── JWT Verification
├── Database Query (pooled connection)
├── Response Formatting
└── Security Headers
```

---

## 🔄 Data Flow Patterns

### Create Expense Flow
```
1. Frontend sends POST /api/expenses
   ├── Headers: Authorization: Bearer <token>
   └── Body: {amount, description, category, friends}

2. Middleware validates JWT token
   └── Extracts user_id

3. Route handler processes request
   ├── Sanitize input
   ├── Validate amount > 0
   ├── Create expense document
   └── Insert into MongoDB

4. Response sent back
   └── {id, message}
```

### Calculate Debts Flow
```
1. Frontend sends GET /api/debts
   └── Headers: Authorization: Bearer <token>

2. Middleware validates JWT token
   └── Extracts user_id

3. Route handler processes request
   ├── Query expenses (user-scoped)
   ├── Query settlements (user-scoped)
   ├── Calculate debt matrix
   └── Optimize debts

4. Response sent back
   └── {debts: [{debtor, creditor, amount}]}
```

---

## 🎯 Scalability Considerations

### Horizontal Scaling
- Stateless application (JWT tokens)
- Connection pooling
- No session storage
- Ready for load balancing

### Vertical Scaling
- Efficient queries
- Indexed collections
- Connection reuse
- Optimized algorithms

### Database Scaling
- MongoDB Atlas auto-scaling
- Sharding support
- Replica sets
- Automatic backups

---

**Architecture Status:** ✅ Production Ready  
**Last Updated:** 2024  
**Deployment:** Render + Gunicorn + MongoDB Atlas
