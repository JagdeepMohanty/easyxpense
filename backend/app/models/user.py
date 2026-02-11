from datetime import datetime
from bson import ObjectId

class User:
    """User model for authentication"""
    
    @staticmethod
    def create(name, password_hash, email=None, phone=None):
        """Create user document"""
        return {
            'name': name,
            'email': email,
            'phone': phone,
            'password_hash': password_hash,
            'created_at': datetime.utcnow(),
            'last_login': None
        }
    
    @staticmethod
    def to_dict(user):
        """Convert user document to safe dict (no password)"""
        if not user:
            return None
        return {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user.get('email'),
            'phone': user.get('phone'),
            'created_at': user['created_at'].isoformat() if user.get('created_at') else None,
            'last_login': user['last_login'].isoformat() if user.get('last_login') else None
        }
