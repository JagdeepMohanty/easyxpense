# Quick Reference - Refactored Architecture

## Service Layer Usage

### In Routes (Example)
```python
from app.services import expense_service

@expenses_v1_bp.route('/', methods=['POST'])
@token_required
def create_expense():
    data = request.get_json()
    expense_id = expense_service.create_expense(
        request.user_id,
        data['amount'],
        data['description'],
        data['category'],
        data.get('friends', []),
        data.get('date')
    )
    return jsonify({'id': expense_id}), 201
```

### Available Services

**auth_service:**
- `login_user(email, phone, password)` → (user, access_token, refresh_token)
- `register_user(name, email, phone, password)` → (user, access_token, refresh_token)
- `refresh_access_token(refresh_token)` → new_access_token

**expense_service:**
- `get_user_expenses(user_id, page, limit)` → {data, total, page, totalPages}
- `create_expense(user_id, amount, description, category, friends, date)` → expense_id
- `delete_expense(user_id, expense_id)` → True

**friend_service:**
- `get_user_friends(user_id, page, limit, search)` → {data, total, page, totalPages}
- `add_friend(user_id, name, phone)` → friend_id
- `update_friend(user_id, friend_id, name, phone)` → True
- `delete_friend(user_id, friend_id)` → True

**debt_service:**
- `calculate_user_debts(user_id, group_id)` → [debts]
- `record_settlement(user_id, from_user, to_user, amount)` → settlement_id

**analytics_service:**
- `get_monthly_summary(user_id, months)` → [monthly_data]
- `get_category_breakdown(user_id)` → [category_data]

---

## API Endpoints

### v1 Endpoints (New)
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/expenses
POST   /api/v1/expenses
DELETE /api/v1/expenses/<id>

GET    /api/v1/friends
POST   /api/v1/friends
PUT    /api/v1/friends/<id>
DELETE /api/v1/friends/<id>

GET    /api/v1/debts
POST   /api/v1/debts/settle

GET    /api/v1/analytics/monthly
GET    /api/v1/analytics/categories
```

### Legacy Endpoints (Maintained)
```
POST   /api/auth/login
POST   /api/auth/register
...
```

---

## Configuration

### Set Environment
```bash
export FLASK_ENV=development  # or production, testing
```

### Config Classes
- `DevelopmentConfig` - DEBUG=True
- `ProductionConfig` - DEBUG=False
- `TestingConfig` - TESTING=True

### Access Config
```python
from flask import current_app
debug_mode = current_app.config.get('DEBUG')
jwt_secret = current_app.config.get('JWT_SECRET_KEY')
```

---

## Frontend API Client

### Fixed Interceptor
```javascript
// Prevents infinite refresh loops
// Queues failed requests
// Single refresh call for multiple 401s
```

### Usage
```javascript
import { authAPI, expensesAPI, friendsAPI } from './services/api';

// Login
const response = await authAPI.login(email, phone, password);

// Get expenses
const expenses = await expensesAPI.getAll(search, page, limit);

// Create expense
await expensesAPI.create(expenseData);
```

---

## Error Handling

### Services throw ValueError
```python
try:
    expense_id = expense_service.create_expense(...)
except ValueError as e:
    return jsonify({'error': str(e)}), 400
```

### Common Patterns
- `ValueError` → 400 Bad Request
- `'not found'` in error → 404 Not Found
- `'already exists'` in error → 409 Conflict
- Other exceptions → 500 Internal Server Error

---

## Adding New Features

### 1. Create Service
```python
# app/services/new_service.py
def new_function(user_id, data):
    # Business logic here
    result = current_app.db.collection.insert_one(data)
    return str(result.inserted_id)
```

### 2. Create v1 Route
```python
# app/routes/new_v1.py
from app.services import new_service

@new_v1_bp.route('/', methods=['POST'])
@token_required
def create_new():
    data = request.get_json()
    result_id = new_service.new_function(request.user_id, data)
    return jsonify({'id': result_id}), 201
```

### 3. Register Blueprint
```python
# app/__init__.py
from app.routes.new_v1 import new_v1_bp
app.register_blueprint(new_v1_bp, url_prefix="/api/v1/new")
```

### 4. Update Frontend
```javascript
// frontend/src/services/api.js
export const newAPI = {
  create: (data) => axiosClient.post('/api/v1/new', data),
};
```

---

## Testing

### Test Service
```python
from app.services import expense_service

def test_create_expense():
    expense_id = expense_service.create_expense(
        user_id='123',
        amount=100.0,
        description='Test',
        category='Food',
        friends=[],
        date=None
    )
    assert expense_id is not None
```

### Test Route
```python
def test_create_expense_route(client):
    response = client.post('/api/v1/expenses', json={
        'amount': 100.0,
        'description': 'Test',
        'category': 'Food'
    })
    assert response.status_code == 201
```

---

## Common Commands

### Backend
```bash
cd backend
python wsgi.py                    # Start server
python setup_indexes.py           # Setup MongoDB indexes
pip install -r requirements.txt   # Install dependencies
```

### Frontend
```bash
cd frontend
npm run dev                       # Start dev server
npm run build                     # Build for production
npm run preview                   # Preview production build
```

---

## Troubleshooting

### Import Errors
- Check `app/services/__init__.py` exports all services
- Verify service files exist in `app/services/`

### Config Not Loading
- Check `FLASK_ENV` environment variable
- Verify config files exist in `app/config/`

### Infinite Refresh Loop
- Check `isRefreshing` flag in interceptor
- Verify `_retry` flag on originalRequest
- Check failedQueue is being processed

### 401 Errors
- Verify cookies are being sent (`withCredentials: true`)
- Check token expiration times
- Verify middleware reads from cookies

---

## Key Files

**Backend:**
- `app/__init__.py` - App factory with v1 routes
- `app/config/` - Environment configurations
- `app/services/` - Business logic layer
- `app/routes/*_v1.py` - Versioned API routes

**Frontend:**
- `frontend/src/services/api.js` - API client with fixed interceptor

**Documentation:**
- `REFACTORING.md` - Detailed refactoring guide
- `REFACTORING_SUMMARY.md` - Complete summary
- `QUICK_REFERENCE.md` - This file
