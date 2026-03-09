from flask import Blueprint, request, jsonify, current_app, make_response
import jwt
import bcrypt
import re
from datetime import datetime, timedelta
from app.utils.helpers import sanitize_input, validate_email, validate_phone
from app.models.user_model import User

auth_bp = Blueprint('auth', __name__)

def validate_strong_password(password):
    """Validate password: min 8 chars, 1 uppercase, 1 number, 1 special char"""
    pattern = r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    return re.match(pattern, password) is not None

def generate_tokens(user_id):
    """Generate access and refresh tokens"""
    access_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(minutes=15)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    refresh_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return access_token, refresh_token

def set_auth_cookies(response, access_token, refresh_token):
    """Set secure HttpOnly cookies"""
    is_production = current_app.config.get('FLASK_ENV') == 'production'
    
    response.set_cookie(
        'access_token',
        access_token,
        httponly=True,
        secure=is_production,
        samesite='Strict' if is_production else 'Lax',
        max_age=900  # 15 minutes
    )
    
    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=is_production,
        samesite='Strict' if is_production else 'Lax',
        max_age=604800  # 7 days
    )
    
    return response

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = sanitize_input(request.get_json())
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        if not email and not phone:
            return jsonify({'error': 'Email or phone is required'}), 400
        
        # Find user
        query = {}
        if email:
            if not validate_email(email):
                return jsonify({'error': 'Invalid email format'}), 400
            query['email'] = email
        else:
            if not validate_phone(phone):
                return jsonify({'error': 'Invalid phone format'}), 400
            query['phone'] = phone
        
        user = current_app.db.users.find_one(query)
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate tokens
        access_token, refresh_token = generate_tokens(str(user['_id']))
        
        # Create response with cookies
        response = make_response(jsonify({
            'user': User.to_dict(user),
            'message': 'Login successful'
        }), 200)
        
        return set_auth_cookies(response, access_token, refresh_token)
        
    except Exception as e:
        current_app.logger.error(f'Login error: {e}')
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = sanitize_input(request.get_json())
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        
        if not all([name, password]):
            return jsonify({'error': 'Name and password are required'}), 400
        
        if not email and not phone:
            return jsonify({'error': 'Email or phone is required'}), 400
        
        if email and not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if phone and not validate_phone(phone):
            return jsonify({'error': 'Invalid phone format'}), 400
        
        # Strong password validation
        if not validate_strong_password(password):
            return jsonify({
                'error': 'Password must be at least 8 characters and include uppercase, number, and special character (@$!%*?&)'
            }), 400
        
        # Check if user exists
        query = {}
        if email:
            query['email'] = email
        if phone:
            query['phone'] = phone
        
        if current_app.db.users.find_one(query):
            return jsonify({'error': 'User already exists'}), 409
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user
        user_data = User.create(name, hashed_password, email, phone)
        result = current_app.db.users.insert_one(user_data)
        
        # Generate tokens
        access_token, refresh_token = generate_tokens(str(result.inserted_id))
        
        user_data['_id'] = result.inserted_id
        
        # Create response with cookies
        response = make_response(jsonify({
            'user': User.to_dict(user_data),
            'message': 'Registration successful'
        }), 201)
        
        return set_auth_cookies(response, access_token, refresh_token)
        
    except Exception as e:
        current_app.logger.error(f'Register error: {e}')
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    try:
        refresh_token = request.cookies.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Missing refresh token'}), 401
        
        try:
            payload = jwt.decode(
                refresh_token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Refresh token expired'}), 401
        except Exception:
            return jsonify({'error': 'Invalid refresh token'}), 401
        
        # Generate new access token
        new_access_token = jwt.encode({
            'user_id': payload['user_id'],
            'exp': datetime.utcnow() + timedelta(minutes=15)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        response = make_response(jsonify({'message': 'Token refreshed'}), 200)
        
        is_production = current_app.config.get('FLASK_ENV') == 'production'
        response.set_cookie(
            'access_token',
            new_access_token,
            httponly=True,
            secure=is_production,
            samesite='Strict' if is_production else 'Lax',
            max_age=900
        )
        
        return response
        
    except Exception as e:
        current_app.logger.error(f'Refresh error: {e}')
        return jsonify({'error': 'Token refresh failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully'}), 200)
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response
