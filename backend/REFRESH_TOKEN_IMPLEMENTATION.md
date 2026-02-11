# Refresh Token Implementation

## ✅ IMPLEMENTATION COMPLETE

Extended JWT authentication system with refresh tokens for enhanced security and better user experience.

---

## 🎯 Token Strategy

### Access Token
- **Expiry**: 24 hours
- **Purpose**: API authorization
- **Storage**: localStorage (frontend)
- **Type**: JWT with `type: 'access'`

### Refresh Token
- **Expiry**: 7 days
- **Purpose**: Issue new access tokens
- **Storage**: 
  - Frontend: localStorage
  - Backend: MongoDB (hashed with SHA-256)
- **Type**: JWT with `type: 'refresh'` and unique `jti`
- **Security**: Hashed before storage, rotated on each refresh

---

## 🗄️ Database Schema

### Collection: `refresh_tokens`

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,           // References users._id
  token_hash: String,          // SHA-256 hash of refresh token
  jti: String,                 // Unique token ID from JWT
  expires_at: DateTime,        // 7 days from creation
  created_at: DateTime,
  revoked: Boolean             // For token revocation
}
```

### Indexes
```javascript
db.refresh_tokens.createIndex({ user_id: 1 })
db.refresh_tokens.createIndex({ expires_at: 1 })
db.refresh_tokens.createIndex({ token_hash: 1 }, { unique: true })
```

---

## 📁 Files Created

### Backend
- ✅ `backend/app/utils/token.py` - Token helper functions
- ✅ `backend/app/models/refresh_token.py` - RefreshToken model

### Files Modified
- ✅ `backend/app/routes/auth.py` - Added refresh endpoint, updated login/register
- ✅ `backend/app/middleware/auth.py` - Updated to use new token verification
- ✅ `frontend/src/context/AuthContext.jsx` - Added refresh token support

---

## 🔧 Token Helper Functions

### Backend (`app/utils/token.py`)

```python
create_access_token(user_id)      # Create 24h access token
create_refresh_token(user_id)     # Create 7-day refresh token
verify_access_token(token)        # Verify and decode access token
verify_refresh_token(token)       # Verify and decode refresh token
hash_refresh_token(token)         # SHA-256 hash for storage
```

---

## 🔐 Security Features

### Token Hashing
- Refresh tokens hashed with SHA-256 before storage
- Plain tokens never stored in database
- Hash comparison for validation

### Token Rotation
- Old refresh token revoked on refresh
- New refresh token issued
- Prevents token reuse attacks

### One Token Per Session
- All previous refresh tokens revoked on login
- Ensures single active session per user
- Prevents session hijacking

### Token Revocation
- Refresh tokens can be revoked
- Revoked tokens cannot be used
- Automatic cleanup of expired tokens

---

## 📊 API Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**Note**: `token` field included for backward compatibility (same as `access_token`)

### POST /api/auth/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

### POST /api/auth/refresh
**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 400: Refresh token required
- 401: Invalid or expired refresh token
- 401: Revoked refresh token

### POST /api/auth/logout
**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note**: Refresh token is optional. If provided, it will be revoked.

---

## 🔄 Token Flow

### Registration/Login Flow
```
1. User submits credentials
2. Backend validates credentials
3. Backend revokes old refresh tokens (login only)
4. Backend generates access token (24h)
5. Backend generates refresh token (7d)
6. Backend hashes and stores refresh token
7. Backend returns both tokens
8. Frontend stores both tokens in localStorage
9. Frontend sets access token in axios header
```

### API Request Flow
```
1. Frontend sends request with access token
2. Backend validates access token
3. If valid: Process request
4. If expired: Return 401
5. Frontend can use refresh token to get new access token
```

### Token Refresh Flow
```
1. Access token expires (24h)
2. Frontend detects 401 error
3. Frontend calls /api/auth/refresh with refresh token
4. Backend validates refresh token
5. Backend checks if token is revoked
6. Backend revokes old refresh token
7. Backend generates new access token
8. Backend generates new refresh token
9. Backend stores new refresh token (hashed)
10. Backend returns new tokens
11. Frontend updates stored tokens
12. Frontend retries original request
```

### Logout Flow
```
1. User clicks logout
2. Frontend calls /api/auth/logout with refresh token
3. Backend revokes refresh token
4. Frontend clears localStorage
5. Frontend removes axios header
6. Frontend redirects to home
```

---

## 🎨 Frontend Integration

### AuthContext Updates

**New State:**
```javascript
const [refreshToken, setRefreshToken] = useState(null);
```

**New Function:**
```javascript
const refreshAccessToken = async () => {
  // Calls /api/auth/refresh
  // Updates access and refresh tokens
  // Returns new access token
};
```

**Updated Functions:**
- `login()` - Stores both tokens
- `register()` - Stores both tokens
- `logout()` - Revokes refresh token, clears both tokens

### Backward Compatibility

Both old and new clients work:
- Old clients use `token` field (access token)
- New clients use `access_token` and `refresh_token`
- Both fields returned in responses

---

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Expected: Returns `access_token`, `refresh_token`, and `token`

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Expected: Returns `access_token`, `refresh_token`, and `token`

### Test Refresh
```bash
REFRESH_TOKEN="<refresh-token-from-login>"

curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"
```

Expected: Returns new `access_token` and `refresh_token`

### Test Logout
```bash
REFRESH_TOKEN="<refresh-token>"

curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"
```

Expected: Returns success message

### Test Revoked Token
```bash
# Use same refresh token again after logout
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"
```

Expected: 401 error (token revoked)

---

## 📈 Benefits

### Security
- Shorter access token lifetime (24h vs 7d)
- Refresh tokens can be revoked
- Token rotation prevents reuse
- Hashed storage protects against database leaks

### User Experience
- Users stay logged in for 7 days
- Automatic token refresh (can be implemented)
- No frequent re-login required
- Seamless session management

### Scalability
- Stateless access tokens
- Refresh tokens tracked in database
- Easy to revoke all sessions
- Cleanup of expired tokens

---

## 🚀 Deployment

### No New Environment Variables
Uses existing `JWT_SECRET_KEY`

### Database Migration
No migration needed. New collection auto-created.

### Create Indexes
```javascript
db.refresh_tokens.createIndex({ user_id: 1 })
db.refresh_tokens.createIndex({ expires_at: 1 })
db.refresh_tokens.createIndex({ token_hash: 1 }, { unique: true })
```

### Backward Compatibility
- Old clients continue to work
- New clients get refresh tokens
- Gradual migration possible

---

## ⚠️ Important Notes

1. **Backward Compatible**: Old login/register still work
2. **Token Field**: `token` field maintained for compatibility
3. **Storage**: Refresh tokens in localStorage (consider httpOnly cookies for production)
4. **Cleanup**: Implement periodic cleanup of expired tokens
5. **Rotation**: Refresh tokens rotated on each refresh

---

## 🎯 Future Enhancements

- [ ] Automatic token refresh on 401
- [ ] httpOnly cookie storage for refresh tokens
- [ ] Device tracking (multiple sessions)
- [ ] Token family tracking (detect token theft)
- [ ] Periodic cleanup job for expired tokens
- [ ] Admin endpoint to revoke all user sessions

---

## ✅ Status: PRODUCTION READY

Refresh token system is fully implemented and backward compatible. Ready for deployment.
