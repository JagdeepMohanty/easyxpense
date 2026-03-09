# EasyXpense Architecture Diagram

## Refactored Architecture (Current)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              src/services/api.js                          │  │
│  │  - Fixed Infinite Refresh Loop                            │  │
│  │  - Request Queue Mechanism                                │  │
│  │  - Single Refresh Call                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            │ HTTP Requests                       │
│                            │ (withCredentials: true)             │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Flask)                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   API Layer (Routes)                      │  │
│  │                                                            │  │
│  │  /api/v1/auth/*        (auth_v1.py)                       │  │
│  │  /api/v1/expenses/*    (expenses_v1.py)                   │  │
│  │  /api/v1/friends/*     (friends_v1.py)                    │  │
│  │  /api/v1/debts/*       (debts_v1.py)                      │  │
│  │  /api/v1/analytics/*   (analytics_v1.py)                  │  │
│  │                                                            │  │
│  │  Legacy Routes (Backward Compatible):                     │  │
│  │  /api/auth/*           (auth.py)                          │  │
│  │  /api/expenses/*       (expenses.py)                      │  │
│  │  /api/friends/*        (friends.py)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            │ Calls                               │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Service Layer (Business Logic)               │  │
│  │                                                            │  │
│  │  auth_service.py       - Authentication logic             │  │
│  │  expense_service.py    - Expense management               │  │
│  │  friend_service.py     - Friend management                │  │
│  │  debt_service.py       - Debt calculations                │  │
│  │  analytics_service.py  - Analytics & reporting            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            │ Uses                                │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Model Layer (Database Access)                │  │
│  │                                                            │  │
│  │  user_model.py         - User CRUD                        │  │
│  │  expense_model.py      - Expense CRUD                     │  │
│  │  debt_model.py         - Debt calculations                │  │
│  │  group_model.py        - Group CRUD                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas (Database)                      │
│                                                                   │
│  Collections:                                                    │
│  - users                                                         │
│  - expenses                                                      │
│  - friends                                                       │
│  - settlements                                                   │
│  - groups                                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Environment Variables                         │
│                                                                   │
│  FLASK_ENV = development | production | testing                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    app/config/__init__.py                        │
│                    get_config() function                         │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │   Dev    │  │   Prod   │  │   Test   │
        │  Config  │  │  Config  │  │  Config  │
        └──────────┘  └──────────┘  └──────────┘
             │             │             │
             └─────────────┴─────────────┘
                           │
                           ▼
                    ┌──────────┐
                    │   Base   │
                    │  Config  │
                    └──────────┘
```

## Request Flow (Token Refresh)

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. API Request (with expired token)
       ▼
┌─────────────────────────────────────────┐
│         Axios Interceptor               │
│  - Detects 401 error                    │
│  - Checks isRefreshing flag             │
└──────┬──────────────────────────────────┘
       │
       │ 2. If not refreshing
       ▼
┌─────────────────────────────────────────┐
│    Set isRefreshing = true              │
│    Call /api/v1/auth/refresh            │
└──────┬──────────────────────────────────┘
       │
       │ 3. Refresh successful
       ▼
┌─────────────────────────────────────────┐
│    Process queued requests              │
│    Retry original request               │
│    Set isRefreshing = false             │
└──────┬──────────────────────────────────┘
       │
       │ 4. Return response
       ▼
┌─────────────┐
│   Client    │
│  (Success)  │
└─────────────┘

Alternative Flow (If already refreshing):
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. API Request (401)
       ▼
┌─────────────────────────────────────────┐
│    isRefreshing = true (already)        │
│    Add request to failedQueue           │
│    Wait for refresh to complete         │
└──────┬──────────────────────────────────┘
       │
       │ 2. Refresh completes
       ▼
┌─────────────────────────────────────────┐
│    processQueue() called                │
│    Retry queued request                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

## Service Layer Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                         Route Handler                            │
│  - Validates input                                               │
│  - Sanitizes data                                                │
│  - Calls service                                                 │
│  - Formats response                                              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Service Layer                            │
│  - Business logic                                                │
│  - Data validation                                               │
│  - Calculations                                                  │
│  - Orchestrates models                                           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Model Layer                              │
│  - Database queries                                              │
│  - Data transformation                                           │
│  - CRUD operations                                               │
└─────────────────────────────────────────────────────────────────┘
```

## API Versioning Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Requests                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │  /api/v1/*   │          │   /api/*     │
        │  (New)       │          │  (Legacy)    │
        └──────┬───────┘          └──────┬───────┘
               │                         │
               │                         │
               ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │  v1 Routes   │          │Legacy Routes │
        │  + Services  │          │  (Original)  │
        └──────┬───────┘          └──────┬───────┘
               │                         │
               └────────────┬────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Database   │
                    └──────────────┘

Benefits:
- Backward compatible
- Gradual migration
- No breaking changes
- Future-proof
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Netlify CDN                              │
│                    (Frontend Hosting)                            │
│                                                                   │
│  - React App (Built with Vite)                                  │
│  - Static Assets                                                 │
│  - SPA Routing                                                   │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ HTTPS Requests
                             │ (CORS Enabled)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Render.com                               │
│                    (Backend Hosting)                             │
│                                                                   │
│  - Flask App (Gunicorn)                                         │
│  - API Endpoints (v1 + Legacy)                                  │
│  - Rate Limiting                                                 │
│  - Security Headers                                              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ MongoDB Protocol
                             │ (Encrypted)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas                               │
│                    (Database Hosting)                            │
│                                                                   │
│  - Managed MongoDB                                               │
│  - Automatic Backups                                             │
│  - Indexes                                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Security Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Login (email/password)
       ▼
┌─────────────────────────────────────────┐
│    POST /api/v1/auth/login              │
│    - Validate credentials               │
│    - Generate tokens                    │
└──────┬──────────────────────────────────┘
       │
       │ 2. Set HttpOnly Cookies
       ▼
┌─────────────────────────────────────────┐
│    Response with Cookies:               │
│    - access_token (15 min)              │
│    - refresh_token (7 days)             │
└──────┬──────────────────────────────────┘
       │
       │ 3. Subsequent requests
       ▼
┌─────────────────────────────────────────┐
│    Cookies sent automatically           │
│    Middleware validates token           │
│    Request processed                    │
└──────┬──────────────────────────────────┘
       │
       │ 4. Token expires (401)
       ▼
┌─────────────────────────────────────────┐
│    Interceptor catches 401              │
│    Calls /api/v1/auth/refresh           │
│    New access_token issued              │
│    Original request retried             │
└─────────────────────────────────────────┘
```
