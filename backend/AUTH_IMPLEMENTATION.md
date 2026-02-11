# JWT Authentication Implementation

## Overview
JWT-based authentication system for EasyXpense backend with bcrypt password hashing and 24-hour token expiry.

## Features
- User registration with email OR phone
- Secure password hashing using bcrypt
- JWT tokens with 24-hour expiry
- Token-based authentication middleware
- Stateless logout (client-side)

## Database

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (optional, unique),
  phone: String (optional, unique),
  password_hash: String,
  created_at: DateTime,
  last_login: DateTime
}
```

### Indexes Required
```javascript
db.users.createIndex({ email: 1 }, { unique: true, sparse: true })
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true })
```

## API Endpoints

### POST /api/auth/register
Register new user with auto-login.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

**Validation:**
- Name: min 2 characters
- Password: min 6 characters
- Email OR phone required (not both mandatory)
- Email format: standard email regex
- Phone format: Indian mobile (10 digits, starts with 6-9)

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "created_at": "2024-01-15T10:30:00",
    "last_login": null
  }
}
```

**Errors:**
- 400: Validation errors
- 409: User already exists
- 500: Registration failed

### POST /api/auth/login
Login existing user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
OR
```json
{
  "phone": "9876543210",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "created_at": "2024-01-15T10:30:00",
    "last_login": "2024-01-15T12:45:00"
  }
}
```

**Errors:**
- 400: Missing fields
- 401: Invalid credentials
- 500: Login failed

### POST /api/auth/logout
Logout user (stateless - client removes token).

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Authentication Middleware

### Usage
Protect routes by importing and applying the `token_required` decorator:

```python
from app.middleware.auth import token_required

@your_bp.route('/protected', methods=['GET'])
@token_required
def protected_route():
    user = request.current_user
    return jsonify({'user_id': str(user['_id'])})
```

### Token Format
Send JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Middleware Behavior
- Extracts token from `Authorization: Bearer <token>` header
- Validates token signature and expiry
- Fetches user from database
- Attaches `request.current_user` for route access
- Returns 401 if token missing, invalid, or expired

## JWT Token Structure

**Payload:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "exp": 1705329600,
  "iat": 1705243200
}
```

**Expiry:** 24 hours from issue time

## Environment Variables

Add to `.env` and deployment platforms:

```bash
JWT_SECRET_KEY=your-secret-key-change-in-production
```

**Production:** Generate secure random key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Security Features

- Passwords hashed with bcrypt (salt rounds: 12)
- Password never stored in plain text
- Password hash never exposed in API responses
- JWT signed with HS256 algorithm
- Token expiry enforced (24 hours)
- Input sanitization on all fields
- Email/phone format validation
- Generic error messages (no user enumeration)

## CORS Configuration

Updated to allow `Authorization` header:
```python
allow_headers=['Content-Type', 'Authorization']
```

## Testing

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:5000/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Files Created/Modified

### New Files
- `backend/app/models/user.py` - User model
- `backend/app/middleware/auth.py` - JWT middleware
- `backend/app/middleware/__init__.py` - Middleware package
- `backend/app/routes/auth.py` - Auth endpoints

### Modified Files
- `backend/app/__init__.py` - Register auth routes, JWT config, CORS headers
- `backend/requirements.txt` - Added bcrypt, PyJWT
- `backend/.env.example` - Added JWT_SECRET_KEY

## Deployment Checklist

1. Install new dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set environment variable on Render:
   ```
   JWT_SECRET_KEY=<generate-secure-key>
   ```

3. Create MongoDB indexes:
   ```javascript
   db.users.createIndex({ email: 1 }, { unique: true, sparse: true })
   db.users.createIndex({ phone: 1 }, { unique: true, sparse: true })
   ```

4. Test endpoints in production

## Next Steps (Optional)

- Protect existing routes with `@token_required`
- Add password reset functionality
- Add refresh token mechanism
- Add user profile update endpoint
- Add email verification
- Add rate limiting on auth endpoints
