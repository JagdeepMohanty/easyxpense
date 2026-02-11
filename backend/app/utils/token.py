import jwt
import secrets
import hashlib
from datetime import datetime, timedelta
from flask import current_app

def create_access_token(user_id):
    """Create access token with 24h expiry"""
    secret_key = current_app.config.get('JWT_SECRET_KEY')
    payload = {
        'user_id': str(user_id),
        'type': 'access',
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, secret_key, algorithm='HS256')

def create_refresh_token(user_id):
    """Create refresh token with 7 days expiry"""
    secret_key = current_app.config.get('JWT_SECRET_KEY')
    payload = {
        'user_id': str(user_id),
        'type': 'refresh',
        'jti': secrets.token_urlsafe(32),  # Unique token ID
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, secret_key, algorithm='HS256')

def verify_access_token(token):
    """Verify and decode access token"""
    try:
        secret_key = current_app.config.get('JWT_SECRET_KEY')
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        
        if payload.get('type') != 'access':
            return None
        
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def verify_refresh_token(token):
    """Verify and decode refresh token"""
    try:
        secret_key = current_app.config.get('JWT_SECRET_KEY')
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        
        if payload.get('type') != 'refresh':
            return None
        
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def hash_refresh_token(token):
    """Hash refresh token for secure storage"""
    return hashlib.sha256(token.encode('utf-8')).hexdigest()
