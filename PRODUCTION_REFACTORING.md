# Production-Ready Refactoring Implementation Guide

## 🎯 Overview

This guide documents the production-ready improvements implemented across frontend and backend.

---

## 📦 Installation Commands

### Frontend Dependencies
```bash
cd frontend
npm install @tanstack/react-query react-hot-toast
```

### Backend Dependencies
```bash
cd backend
pip install pydantic
```

---

## 🎨 FRONTEND IMPROVEMENTS

### 1. Centralized Axios Client (`/src/api/apiClient.js`)

**Features:**
- ✅ Global 401 error handling
- ✅ Automatic logout on session expiry
- ✅ Token refresh with queue mechanism
- ✅ Toast notifications for errors
- ✅ Network error handling

**Usage:**
```javascript
import apiClient from '../api/apiClient'

// All requests automatically handled
const response = await apiClient.get('/api/v1/expenses')
```

**Automatic Behaviors:**
- 401 → Refresh token → Retry request
- 401 (refresh fails) → Logout → Redirect to /login
- 500 → Toast: "Server error"
- 403 → Toast: "Access denied"
- 404 → Toast: "Resource not found"
- Network error → Toast: "Network error"

---

### 2. React Query Hooks

**All hooks updated to use:**
- `apiClient` instead of direct API imports
- Toast notifications on success/error
- Proper stale time configuration

**Hooks:**
- `useExpenses.js` - Expense CRUD with toasts
- `useFriends.js` - Friend CRUD with toasts
- `useDebts.js` - Debt queries with toasts
- `useAnalytics.js` - Analytics queries
- `useGroups.js` - Group CRUD with toasts

**Example Usage:**
```javascript
import { useExpenses, useCreateExpense } from '../hooks/useExpenses'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'

function ExpensesPage() {
  const { data, isLoading, error } = useExpenses(page)
  const createMutation = useCreateExpense()

  if (isLoading) return <LoadingSkeleton type="list" count={5} />
  if (error) return <div>Error loading expenses</div>

  const handleCreate = async (formData) => {
    await createMutation.mutateAsync(formData)
    // Toast automatically shown on success/error
  }

  return <div>{/* Render expenses */}</div>
}
```

---

### 3. Loading Skeleton Component (`/src/components/ui/LoadingSkeleton.jsx`)

**Props:**
- `type`: 'list' | 'card' | 'table'
- `count`: number of skeleton items

**Usage:**
```javascript
<LoadingSkeleton type="card" count={6} />  // Grid of cards
<LoadingSkeleton type="list" count={5} />  // List items
<LoadingSkeleton type="table" count={10} /> // Table rows
```

---

### 4. Error Boundary (`/src/components/ErrorBoundary.jsx`)

**Features:**
- Catches React rendering errors
- Shows user-friendly error UI
- Provides reload button
- Logs errors to console

**Already wrapped in main.jsx** - No additional setup needed

---

### 5. Toast Notifications

**Automatic toasts in hooks:**
- ✅ Expense added/deleted
- ✅ Friend added/updated/deleted
- ✅ Group created/deleted
- ✅ Settlement completed
- ✅ API errors

**Manual usage:**
```javascript
import toast from 'react-hot-toast'

toast.success('Action completed')
toast.error('Action failed')
toast.loading('Processing...')
```

---

## 🔧 BACKEND IMPROVEMENTS

### 1. Structured Logging (`/backend/app/utils/logger.py`)

**Functions:**
- `log_info(message, **kwargs)` - INFO level
- `log_error(message, **kwargs)` - ERROR level
- `log_warning(message, **kwargs)` - WARNING level
- `log_request(method, path, user_id)` - Request logging
- `log_response(method, path, status_code, user_id)` - Response logging

**Usage in Routes:**
```python
from app.utils.logger import log_info, log_error, log_request, log_response

@app.route('/api/v1/expenses', methods=['POST'])
def create_expense():
    log_request('POST', '/api/v1/expenses', request.user_id)
    
    try:
        # Create expense logic
        log_info('expense_created', expense_id=expense_id, user_id=request.user_id)
        log_response('POST', '/api/v1/expenses', 201, request.user_id)
        return success_response(data, 'Expense created'), 201
    except Exception as e:
        log_error('expense_creation_failed', reason=str(e), user_id=request.user_id)
        return error_response('Failed to create expense', 'CREATION_FAILED'), 500
```

**Log Output:**
```
INFO  request_received method=POST path=/api/v1/expenses user_id=123
INFO  expense_created expense_id=456 user_id=123
INFO  request_completed method=POST path=/api/v1/expenses status=201 user_id=123
```

---

### 2. Standardized API Responses (`/backend/app/utils/api_response.py`)

**Functions:**
- `success_response(data, message, status_code)` - Success responses
- `error_response(message, error_code, status_code)` - Error responses
- `paginated_response(data, total, page, limit, message)` - Paginated responses

**Usage:**
```python
from app.utils.api_response import success_response, error_response, paginated_response

# Success
return success_response(
    data={'expense': expense_dict},
    message='Expense created successfully'
)

# Error
return error_response(
    message='Invalid expense data',
    error_code='INVALID_DATA',
    status_code=400
)

# Paginated
return paginated_response(
    data=expenses,
    total=total_count,
    page=page,
    limit=limit,
    message='Expenses retrieved'
)
```

**Response Format:**
```json
{
  "success": true,
  "data": {...},
  "message": "Expense created successfully",
  "error": null
}
```

---

### 3. Pydantic Request Validation

**Schemas Created:**
- `UserLoginSchema` - Login validation
- `UserRegisterSchema` - Registration validation
- `ExpenseCreateSchema` - Expense creation validation
- `FriendCreateSchema` - Friend creation validation
- `FriendUpdateSchema` - Friend update validation
- `GroupCreateSchema` - Group creation validation

**Usage in Routes:**
```python
from pydantic import ValidationError
from app.schemas import ExpenseCreateSchema
from app.utils.api_response import success_response, error_response

@app.route('/api/v1/expenses', methods=['POST'])
def create_expense():
    try:
        # Validate request data
        schema = ExpenseCreateSchema(**request.get_json())
        
        # Use validated data
        expense_id = expense_service.create_expense(
            user_id=request.user_id,
            amount=schema.amount,
            description=schema.description,
            category=schema.category,
            friends=schema.friends,
            date=schema.date
        )
        
        return success_response(
            data={'id': expense_id},
            message='Expense created'
        )
        
    except ValidationError as e:
        return error_response(
            message=str(e.errors()[0]['msg']),
            error_code='VALIDATION_ERROR',
            status_code=400
        )
```

---

### 4. Pagination Limits

**Implementation:**
```python
def get_pagination_params(request):
    """Get and validate pagination parameters"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    # Enforce maximum limit
    if limit > 100:
        limit = 100
    
    return page, limit

# Usage in routes
@app.route('/api/v1/expenses', methods=['GET'])
def get_expenses():
    page, limit = get_pagination_params(request)
    # Use validated page and limit
```

---

## 📊 Example: Complete Route Implementation

### Backend Route with All Improvements

```python
from flask import Blueprint, request
from pydantic import ValidationError
from app.middleware.auth import token_required
from app.schemas import ExpenseCreateSchema
from app.services import expense_service
from app.utils.logger import log_info, log_error, log_request, log_response
from app.utils.api_response import success_response, error_response, paginated_response

expenses_v1_bp = Blueprint('expenses_v1', __name__)

@expenses_v1_bp.route('/', methods=['GET'])
@token_required
async def get_expenses():
    log_request('GET', '/api/v1/expenses', request.user_id)
    
    try:
        # Get and validate pagination
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 10)), 100)
        
        # Fetch data
        result = await expense_service.async_get_user_expenses(
            request.user_id, page, limit
        )
        
        log_info('expenses_retrieved', count=len(result['data']), user_id=request.user_id)
        log_response('GET', '/api/v1/expenses', 200, request.user_id)
        
        return paginated_response(
            data=result['data'],
            total=result['total'],
            page=page,
            limit=limit,
            message='Expenses retrieved successfully'
        )
        
    except Exception as e:
        log_error('expenses_retrieval_failed', reason=str(e), user_id=request.user_id)
        return error_response(
            message='Failed to fetch expenses',
            error_code='FETCH_FAILED',
            status_code=500
        )

@expenses_v1_bp.route('/', methods=['POST'])
@token_required
async def create_expense():
    log_request('POST', '/api/v1/expenses', request.user_id)
    
    try:
        # Validate request
        schema = ExpenseCreateSchema(**request.get_json())
        
        # Create expense
        expense_id = await expense_service.async_create_expense(
            request.user_id,
            schema.amount,
            schema.description,
            schema.category,
            schema.friends,
            schema.date
        )
        
        log_info('expense_created', expense_id=expense_id, user_id=request.user_id)
        log_response('POST', '/api/v1/expenses', 201, request.user_id)
        
        return success_response(
            data={'id': expense_id},
            message='Expense created successfully',
            status_code=201
        )
        
    except ValidationError as e:
        log_error('expense_validation_failed', reason=str(e), user_id=request.user_id)
        return error_response(
            message=str(e.errors()[0]['msg']),
            error_code='VALIDATION_ERROR',
            status_code=400
        )
    except ValueError as e:
        log_error('expense_creation_failed', reason=str(e), user_id=request.user_id)
        return error_response(
            message=str(e),
            error_code='CREATION_FAILED',
            status_code=400
        )
    except Exception as e:
        log_error('expense_creation_error', reason=str(e), user_id=request.user_id)
        return error_response(
            message='Failed to create expense',
            error_code='SERVER_ERROR',
            status_code=500
        )
```

---

### Frontend Component with All Improvements

```javascript
import { useState } from 'react'
import { useExpenses, useCreateExpense, useDeleteExpense } from '../hooks/useExpenses'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import toast from 'react-hot-toast'

function ExpensesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useExpenses(page)
  const createMutation = useCreateExpense()
  const deleteMutation = useDeleteExpense()

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton type="list" count={5} />
  }

  // Error state
  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">Failed to load expenses</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  const expenses = data?.data?.items || []

  const handleCreate = async (formData) => {
    try {
      await createMutation.mutateAsync(formData)
      // Toast automatically shown by hook
    } catch (error) {
      // Error toast automatically shown by hook
      console.error('Create failed:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this expense?')) {
      try {
        await deleteMutation.mutateAsync(id)
        // Toast automatically shown by hook
      } catch (error) {
        // Error toast automatically shown by hook
        console.error('Delete failed:', error)
      }
    }
  }

  return (
    <div>
      <h1>Expenses</h1>
      {expenses.map(expense => (
        <div key={expense.id}>
          <span>{expense.description}</span>
          <button onClick={() => handleDelete(expense.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

export default ExpensesPage
```

---

## ✅ Verification Checklist

### Frontend
- [x] apiClient created with error handling
- [x] All hooks use apiClient
- [x] Toast notifications on all mutations
- [x] LoadingSkeleton component created
- [x] ErrorBoundary wraps app
- [x] React Query configured in main.jsx

### Backend
- [x] Structured logging utility created
- [x] API response utility created
- [x] Pydantic schemas created
- [x] Pagination limits enforced
- [x] All responses standardized

---

## 🚀 Deployment Notes

### No Breaking Changes
- ✅ All existing endpoints work
- ✅ Response formats enhanced (backward compatible)
- ✅ Frontend gracefully handles old and new responses
- ✅ Logging is additive (doesn't break existing code)

### Production Ready
- ✅ Global error handling
- ✅ Structured logging
- ✅ Request validation
- ✅ Standardized responses
- ✅ Loading states
- ✅ User feedback (toasts)
- ✅ Crash protection (error boundary)

---

## 📚 Additional Resources

- React Query Docs: https://tanstack.com/query/latest
- Pydantic Docs: https://docs.pydantic.dev/
- React Hot Toast: https://react-hot-toast.com/

---

**Implementation Complete** ✅
**Production Ready** ✅
**Zero Breaking Changes** ✅
