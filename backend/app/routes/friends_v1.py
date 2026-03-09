from flask import Blueprint, request, jsonify, current_app
from pydantic import ValidationError
from app.middleware.auth import token_required
from app.dto.friend_dto import FriendCreateDTO, FriendUpdateDTO
from app.services import friend_service

friends_v1_bp = Blueprint('friends_v1', __name__)

@friends_v1_bp.route('/', methods=['GET'])
@token_required
async def get_friends():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        
        result = await friend_service.async_get_user_friends(request.user_id, page, limit, search)
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f'Get friends error: {e}')
        return jsonify({'error': 'Failed to fetch friends'}), 500

@friends_v1_bp.route('/', methods=['POST'])
@token_required
async def add_friend():
    try:
        dto = FriendCreateDTO(**request.get_json())
        
        friend_id = await friend_service.async_add_friend(request.user_id, dto.name, dto.phone)
        
        return jsonify({
            'id': friend_id,
            'message': 'Friend added successfully'
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': str(e.errors()[0]['msg'])}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 409
    except Exception as e:
        current_app.logger.error(f'Add friend error: {e}')
        return jsonify({'error': 'Failed to add friend'}), 500

@friends_v1_bp.route('/<friend_id>', methods=['PUT'])
@token_required
def update_friend(friend_id):
    try:
        dto = FriendUpdateDTO(**request.get_json())
        
        friend_service.update_friend(request.user_id, friend_id, dto.name, dto.phone)
        return jsonify({'message': 'Friend updated successfully'}), 200
        
    except ValidationError as e:
        return jsonify({'error': str(e.errors()[0]['msg'])}), 400
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
