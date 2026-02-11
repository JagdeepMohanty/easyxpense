from flask import Blueprint, request, jsonify, current_app
import bcrypt
from datetime import datetime, timedelta
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.utils.sanitize import sanitize_input
from app.utils.token import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    hash_refresh_token
)
import re

auth_bp = Blueprint('auth', __name__)

# Simple rate limiting (in-memory)
login_attempts = {}

def check_rate_limit(identifier, max_attempts=5, window_minutes=15):
    """Check if identifier has exceeded rate limit"""
    now = datetime.utcnow()
    if identifier in login_attempts:
        attempts, first_attempt = login_attempts[identifier]
        if now - first_attempt < timedelta(minutes=window_minutes):
            if attempts >= max_attempts:
                return False
            login_attempts[identifier] = (attempts + 1, first_attempt)
        else:
            login_attempts[identifier] = (1, now)
    else:
        login_attempts[identifier] = (1, now)
    return True

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate Indian phone number (10 digits, starts with 6-9)"""
    pattern = r'^[6-9]\d{9}$'
    return re.match(pattern, phone) is not None

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        name = sanitize_input(data.get('name', '').strip())
        password = data.get('password', '').strip()
        email = sanitize_input(data.get('email', '').strip()) if data.get('email') else None
        phone = sanitize_input(data.get('phone', '').strip()) if data.get('phone') else None
        
        if not name or len(name) < 2:
            return jsonify({'success': False, 'error': 'Name must be at least 2 characters'}), 400
        
        if not password or len(password) < 6:
            return jsonify({'success': False, 'error': 'Password must be at least 6 characters'}), 400
        
        if len(password) > 128:
            return jsonify({'success': False, 'error': 'Password too long'}), 400
        
        if len(name) > 100:
            return jsonify({'success': False, 'error': 'Name too long'}), 400
        
        # Must have either email or phone
        if not email and not phone:
            return jsonify({'success': False, 'error': 'Email or phone number required'}), 400
        
        # Validate email format
        if email and not validate_email(email):
            return jsonify({'success': False, 'error': 'Invalid email format'}), 400
        
        # Validate phone format
        if phone and not validate_phone(phone):
            return jsonify({'success': False, 'error': 'Invalid phone number'}), 400
        
        # Check for existing user
        query = []
        if email:
            query.append({'email': email})
        if phone:
            query.append({'phone': phone})
        
        existing_user = current_app.db.users.find_one({'$or': query})
        if existing_user:
            return jsonify({'success': False, 'error': 'User already exists'}), 409
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user
        user_doc = User.create(name, password_hash, email, phone)
        result = current_app.db.users.insert_one(user_doc)
        
        # Generate tokens
        access_token = create_access_token(result.inserted_id)
        refresh_token = create_refresh_token(result.inserted_id)
        
        # Store refresh token
        refresh_token_model = RefreshToken(current_app.db)
        token_hash = hash_refresh_token(refresh_token)
        payload = verify_refresh_token(refresh_token)
        refresh_token_model.create(result.inserted_id, token_hash, payload['jti'])
        
        # Get user data
        user = current_app.db.users.find_one({'_id': result.inserted_id})
        
        current_app.logger.info(f'User registered: {email or phone}')
        
        return jsonify({
            'success': True,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token': access_token,  # Backward compatibility
            'user': User.to_dict(user)
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Register error: {e}')
        return jsonify({'success': False, 'error': 'Registration failed'}), 500

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        email = sanitize_input(data.get('email', '').strip()) if data.get('email') else None
        phone = sanitize_input(data.get('phone', '').strip()) if data.get('phone') else None
        password = data.get('password', '').strip()
        
        if not password:
            return jsonify({'success': False, 'error': 'Password required'}), 400
        
        if not email and not phone:
            return jsonify({'success': False, 'error': 'Email or phone required'}), 400
        
        # Rate limiting
        identifier = email or phone
        if not check_rate_limit(identifier):
            return jsonify({'success': False, 'error': 'Too many login attempts. Try again later.'}), 429
        
        # Find user
        query = {'email': email} if email else {'phone': phone}
        user = current_app.db.users.find_one(query)
        
        if not user:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        # Revoke old refresh tokens
        refresh_token_model = RefreshToken(current_app.db)
        refresh_token_model.revoke_all_for_user(user['_id'])
        
        # Update last login
        current_app.db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        # Generate new tokens
        access_token = create_access_token(user['_id'])
        refresh_token = create_refresh_token(user['_id'])
        
        # Store refresh token
        token_hash = hash_refresh_token(refresh_token)
        payload = verify_refresh_token(refresh_token)
        refresh_token_model.create(user['_id'], token_hash, payload['jti'])
        
        current_app.logger.info(f'User logged in: {email or phone}')
        
        return jsonify({
            'success': True,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token': access_token,  # Backward compatibility
            'user': User.to_dict(user)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Login error: {e}')
        return jsonify({'success': False, 'error': 'Login failed'}), 500

@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    """Logout user and revoke refresh token"""
    try:
        data = request.get_json() or {}
        refresh_token = data.get('refresh_token')
        
        if refresh_token:
            # Revoke the refresh token
            token_hash = hash_refresh_token(refresh_token)
            refresh_token_model = RefreshToken(current_app.db)
            refresh_token_model.revoke(token_hash)
        
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200
    except Exception as e:
        current_app.logger.error(f'Logout error: {e}')
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

@auth_bp.route('/auth/refresh', methods=['POST'])
def refresh():
    """Refresh access token using refresh token"""
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'success': False, 'error': 'Refresh token required'}), 400
        
        # Verify refresh token
        payload = verify_refresh_token(refresh_token)
        if not payload:
            return jsonify({'success': False, 'error': 'Invalid or expired refresh token'}), 401
        
        # Check if token exists and is not revoked
        token_hash = hash_refresh_token(refresh_token)
        refresh_token_model = RefreshToken(current_app.db)
        stored_token = refresh_token_model.find_by_hash(token_hash)
        
        if not stored_token:
            return jsonify({'success': False, 'error': 'Invalid or revoked refresh token'}), 401
        
        user_id = payload['user_id']
        
        # Revoke old refresh token
        refresh_token_model.revoke(token_hash)
        
        # Generate new tokens (token rotation)
        new_access_token = create_access_token(user_id)
        new_refresh_token = create_refresh_token(user_id)
        
        # Store new refresh token
        new_token_hash = hash_refresh_token(new_refresh_token)
        new_payload = verify_refresh_token(new_refresh_token)
        refresh_token_model.create(stored_token['user_id'], new_token_hash, new_payload['jti'])
        
        current_app.logger.info(f'Token refreshed for user: {user_id}')
        
        return jsonify({
            'success': True,
            'access_token': new_access_token,
            'refresh_token': new_refresh_token,
            'token': new_access_token  # Backward compatibility
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Refresh token error: {e}')
        return jsonify({'success': False, 'error': 'Token refresh failed'}), 500
