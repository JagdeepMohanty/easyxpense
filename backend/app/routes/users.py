from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.models.user_model import User
from bson import ObjectId
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    try:
        user = current_app.db.users.find_one({'_id': ObjectId(request.user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': User.to_dict(user)}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get user error: {e}')
        return jsonify({'error': 'Failed to fetch user'}), 500

@users_bp.route('/friends', methods=['GET'])
@token_required
def get_friends():
    try:
        friends = list(current_app.db.friends.find({'user_id': request.user_id}).sort('created_at', -1))
        
        for friend in friends:
            friend['_id'] = str(friend['_id'])
        
        return jsonify({'friends': friends}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get friends error: {e}')
        return jsonify({'error': 'Failed to fetch friends'}), 500

@users_bp.route('/friends', methods=['POST'])
@token_required
def add_friend():
    try:
        data = request.get_json()
        name = data.get('name')
        
        if not name:
            return jsonify({'error': 'Friend name is required'}), 400
        
        friend_data = {
            'user_id': request.user_id,
            'name': name,
            'created_at': datetime.utcnow()
        }
        
        result = current_app.db.friends.insert_one(friend_data)
        
        return jsonify({
            'id': str(result.inserted_id),
            'message': 'Friend added successfully'
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Add friend error: {e}')
        return jsonify({'error': 'Failed to add friend'}), 500
