from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.utils.helpers import sanitize_input, validate_phone
from app.services import friend_service

friends_v1_bp = Blueprint('friends_v1', __name__)

@friends_v1_bp.route('/', methods=['GET'])
@token_required
def get_friends():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        
        result = friend_service.get_user_friends(request.user_id, page, limit, search)
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f'Get friends error: {e}')
        return jsonify({'error': 'Failed to fetch friends'}), 500

@friends_v1_bp.route('/', methods=['POST'])
@token_required
def add_friend():
    try:
        data = sanitize_input(request.get_json())
        name = data.get('name')
        phone = data.get('phone')
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        if phone and not validate_phone(phone):
            return jsonify({'error': 'Invalid phone format'}), 400
        
        friend_id = friend_service.add_friend(request.user_id, name, phone)
        
        return jsonify({
            'id': friend_id,
            'message': 'Friend added successfully'
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 409
    except Exception as e:
        current_app.logger.error(f'Add friend error: {e}')
        return jsonify({'error': 'Failed to add friend'}), 500

@friends_v1_bp.route('/<friend_id>', methods=['PUT'])
@token_required
def update_friend(friend_id):
    try:
        data = sanitize_input(request.get_json())
        name = data.get('name')
        phone = data.get('phone')
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        if phone and not validate_phone(phone):
            return jsonify({'error': 'Invalid phone format'}), 400
        
        friend_service.update_friend(request.user_id, friend_id, name, phone)
        return jsonify({'message': 'Friend updated successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        current_app.logger.error(f'Update friend error: {e}')
        return jsonify({'error': 'Failed to update friend'}), 500

@friends_v1_bp.route('/<friend_id>', methods=['DELETE'])
@token_required
def delete_friend(friend_id):
    try:
        friend_service.delete_friend(request.user_id, friend_id)
        return jsonify({'message': 'Friend deleted successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        current_app.logger.error(f'Delete friend error: {e}')
        return jsonify({'error': 'Failed to delete friend'}), 500
