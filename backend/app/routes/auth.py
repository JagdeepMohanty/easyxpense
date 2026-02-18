from flask import Blueprint, request, jsonify, current_app
import jwt
import bcrypt
from datetime import datetime, timedelta
from app.utils.sanitize import sanitize_input, validate_email, validate_phone

auth_bp = Blueprint('auth', __name__)

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
        
        # Generate token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + timedelta(days=7)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user.get('email'),
                'phone': user.get('phone')
            }
        }), 200
        
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
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
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
        user_data = {
            'name': name,
            'password': hashed_password,
            'created_at': datetime.utcnow()
        }
        
        if email:
            user_data['email'] = email
        if phone:
            user_data['phone'] = phone
        
        result = current_app.db.users.insert_one(user_data)
        
        # Generate token
        token = jwt.encode({
            'user_id': str(result.inserted_id),
            'exp': datetime.utcnow() + timedelta(days=7)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': str(result.inserted_id),
                'name': name,
                'email': email,
                'phone': phone
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Register error: {e}')
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200