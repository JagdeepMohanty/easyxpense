from flask import Blueprint, request, jsonify, current_app, make_response
from app.utils.helpers import sanitize_input, validate_email, validate_phone
from app.services import auth_service

auth_v1_bp = Blueprint('auth_v1', __name__)

def set_auth_cookies(response, access_token, refresh_token):
    is_production = current_app.config.get('FLASK_ENV') == 'production'
    
    response.set_cookie(
        'access_token',
        access_token,
        httponly=True,
        secure=is_production,
        samesite='Strict' if is_production else 'Lax',
        max_age=900
    )
    
    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=is_production,
        samesite='Strict' if is_production else 'Lax',
        max_age=604800
    )
    
    return response

@auth_v1_bp.route('/login', methods=['POST'])
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
        
        if email and not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if phone and not validate_phone(phone):
            return jsonify({'error': 'Invalid phone format'}), 400
        
        user, access_token, refresh_token = auth_service.login_user(email, phone, password)
        
        response = make_response(jsonify({
            'user': user,
            'message': 'Login successful'
        }), 200)
        
        return set_auth_cookies(response, access_token, refresh_token)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        current_app.logger.error(f'Login error: {e}')
        return jsonify({'error': 'Login failed'}), 500

@auth_v1_bp.route('/register', methods=['POST'])
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
        
        user, access_token, refresh_token = auth_service.register_user(name, email, phone, password)
        
        response = make_response(jsonify({
            'user': user,
            'message': 'Registration successful'
        }), 201)
        
        return set_auth_cookies(response, access_token, refresh_token)
        
    except ValueError as e:
        status_code = 409 if 'already exists' in str(e) else 400
        return jsonify({'error': str(e)}), status_code
    except Exception as e:
        current_app.logger.error(f'Register error: {e}')
        return jsonify({'error': 'Registration failed'}), 500

@auth_v1_bp.route('/refresh', methods=['POST'])
def refresh():
    try:
        refresh_token = request.cookies.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Missing refresh token'}), 401
        
        new_access_token = auth_service.refresh_access_token(refresh_token)
        
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
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        current_app.logger.error(f'Refresh error: {e}')
        return jsonify({'error': 'Token refresh failed'}), 500

@auth_v1_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully'}), 200)
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response
