import bcrypt
import jwt
import re
from datetime import datetime, timedelta
from flask import current_app
from app.models.user_model import User
from app.repositories.user_repository import UserRepository

def validate_strong_password(password):
    pattern = r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    return re.match(pattern, password) is not None

def generate_tokens(user_id):
    access_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(minutes=15)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    refresh_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return access_token, refresh_token

def login_user(email, phone, password):
    user = UserRepository.find_by_email_or_phone(email, phone)
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        raise ValueError('Invalid credentials')
    
    access_token, refresh_token = generate_tokens(str(user['_id']))
    return User.to_dict(user), access_token, refresh_token

def register_user(name, email, phone, password):
    if not validate_strong_password(password):
        raise ValueError('Password must be at least 8 characters and include uppercase, number, and special character')
    
    if UserRepository.find_by_email_or_phone(email, phone):
        raise ValueError('User already exists')
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_data = User.create(name, hashed_password, email, phone)
    result = UserRepository.create(user_data)
    user_data['_id'] = result.inserted_id
    
    access_token, refresh_token = generate_tokens(str(result.inserted_id))
    return User.to_dict(user_data), access_token, refresh_token

async def async_register_user(name, email, phone, password):
    """Async version for better performance"""
    if not validate_strong_password(password):
        raise ValueError('Password must be at least 8 characters and include uppercase, number, and special character')
    
    if UserRepository.find_by_email_or_phone(email, phone):
        raise ValueError('User already exists')
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_data = User.create(name, hashed_password, email, phone)
    result = await UserRepository.async_create(user_data)
    user_data['_id'] = result.inserted_id
    
    access_token, refresh_token = generate_tokens(str(result.inserted_id))
    return User.to_dict(user_data), access_token, refresh_token

def refresh_access_token(refresh_token):
    try:
        payload = jwt.decode(refresh_token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise ValueError('Refresh token expired')
    except Exception:
        raise ValueError('Invalid refresh token')
    
    new_access_token = jwt.encode({
        'user_id': payload['user_id'],
        'exp': datetime.utcnow() + timedelta(minutes=15)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return new_access_token
