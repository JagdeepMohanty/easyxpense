from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

def jwt_required_custom(f):
    """Custom JWT required decorator that works with the existing frontend token format"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('x-auth-token')
        
        if not token:
            return jsonify({'msg': 'No token, authorization denied'}), 401
        
        try:
            import jwt
            decoded = jwt.decode(
                token, 
                current_app.config['JWT_SECRET_KEY'], 
                algorithms=['HS256']
            )
            
            # Extract user ID from token payload
            user_id = decoded.get('user', {}).get('id')
            if not user_id:
                return jsonify({'msg': 'Token is not valid'}), 401
            
            # Verify user exists (only if DB is available)
            if current_app.db:
                user_model = User(current_app.db)
                user = user_model.find_by_id(user_id)
                if not user:
                    return jsonify({'msg': 'User not found'}), 401
                request.current_user = user
            else:
                request.current_user = None
            
            # Add user info to request context
            request.current_user_id = user_id
            
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'msg': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'msg': 'Token is not valid'}), 401
        except Exception as e:
            current_app.logger.error(f'Auth middleware error: {e}')
            return jsonify({'msg': 'Token is not valid'}), 401
    
    return decorated_function