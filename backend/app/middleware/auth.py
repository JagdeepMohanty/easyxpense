from functools import wraps
from flask import request, jsonify, current_app
from bson import ObjectId
from app.utils.token import verify_access_token

def token_required(f):
    """Middleware to validate JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        
        try:
            # Verify access token
            payload = verify_access_token(token)
            if not payload:
                return jsonify({'success': False, 'error': 'Invalid or expired token'}), 401
            
            # Get user from database
            user = current_app.db.users.find_one({'_id': ObjectId(payload['user_id'])})
            if not user:
                return jsonify({'success': False, 'error': 'Invalid token'}), 401
            
            # Attach user to request
            request.current_user = user
            
        except Exception as e:
            current_app.logger.error(f'Token validation error: {e}')
            return jsonify({'success': False, 'error': 'Authentication failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated
