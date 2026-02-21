"""
Authentication Service
Business logic for authentication operations
"""
import jwt
import bcrypt
from datetime import datetime, timedelta
from flask import current_app


class AuthService:
    """Service for handling authentication operations"""
    
    @staticmethod
    def validate_credentials(email=None, phone=None, password=None):
        """Validate user credentials and return user if valid"""
        if not password:
            return None, 'Password is required'
        
        if not email and not phone:
            return None, 'Email or phone is required'
        
        # Build query
        query = {}
        if email:
            query['email'] = email
        else:
            query['phone'] = phone
        
        # Find user
        user = current_app.db.users.find_one(query)
        if not user:
            return None, 'Invalid credentials'
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return None, 'Invalid credentials'
        
        return user, None
    
    @staticmethod
    def generate_token(user_id):
        """Generate JWT token for user"""
        return jwt.encode({
            'user_id': str(user_id),
            'exp': datetime.utcnow() + timedelta(days=7)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    @staticmethod
    def format_user_response(user):
        """Format user data for response"""
        return {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user.get('email'),
            'phone': user.get('phone')
        }
    
    @staticmethod
    def create_user(name, email=None, phone=None, password=None):
        """Create a new user"""
        if not all([name, password]):
            return None, 'Name and password are required'
        
        if not email and not phone:
            return None, 'Email or phone is required'
        
        if len(password) < 6:
            return None, 'Password must be at least 6 characters'
        
        # Check if user exists
        query = {}
        if email:
            query['email'] = email
        if phone:
            query['phone'] = phone
        
        if current_app.db.users.find_one(query):
            return None, 'User already exists'
        
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
        user_data['_id'] = result.inserted_id
        
        return user_data, None
