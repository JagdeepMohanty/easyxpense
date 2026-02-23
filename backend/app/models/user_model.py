from datetime import datetime

class User:
    @staticmethod
    def create(name, password_hash, email=None, phone=None):
        """Create user document"""
        return {
            'name': name,
            'password': password_hash,
            'email': email,
            'phone': phone,
            'created_at': datetime.utcnow()
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
            'created_at': user['created_at'].isoformat() if user.get('created_at') else None
        }
