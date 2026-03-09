from flask import Blueprint, request, jsonify, current_app, make_response
from pydantic import ValidationError
from app.dto.auth_dto import LoginDTO, RegisterDTO
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
        dto = LoginDTO(**request.get_json())
        user, access_token, refresh_token = auth_service.login_user(dto.email, dto.phone, dto.password)
        
        response = make_response(jsonify({
            'user': user,
            'message': 'Login successful'
        }), 200)
        
        return set_auth_cookies(response, access_token, refresh_token)
        
    except ValidationError as e:
        return jsonify({'error': str(e.errors()[0]['msg'])}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        current_app.logger.error(f'Login error: {e}')
        return jsonify({'error': 'Login failed'}), 500

@auth_v1_bp.route('/register', methods=['POST'])
async def register():
    try:
        dto = RegisterDTO(**request.get_json())
        user, access_token, refresh_token = await auth_service.async_register_user(
            dto.name, dto.email, dto.phone, dto.password
        )
        
        response = make_response(jsonify({
            'user': user,
            'message': 'Registration successful'
        }), 201)
        
        return set_auth_cookies(response, access_token, refresh_token)
        
    except ValidationError as e:
        return jsonify({'error': str(e.errors()[0]['msg'])}), 400
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
