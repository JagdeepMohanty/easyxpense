from flask import Blueprint, request, jsonify, current_app
import jwt
from bson import ObjectId
from datetime import datetime
from app.utils.helpers import sanitize_input, validate_phone

friends_bp = Blueprint('friends', __name__)

def get_current_user():
    token = request.headers.get('Authorization')
    if not token or not token.startswith('Bearer '):
        return None
    
    try:
        token = token.split(' ')[1]
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

@friends_bp.route('/', methods=['GET'])
def get_friends():
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        
        query = {'user_id': user_id}
        if search:
            query['name'] = {'$regex': search, '$options': 'i'}
        
        total = current_app.db.friends.count_documents(query)
        friends = list(current_app.db.friends.find(query)
                      .skip((page - 1) * limit)
                      .limit(limit)
                      .sort('name', 1))
        
        for friend in friends:
            friend['_id'] = str(friend['_id'])
        
        return jsonify({
            'data': friends,
            'total': total,
            'page': page,
            'totalPages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get friends error: {e}')
        return jsonify({'error': 'Failed to fetch friends'}), 500

@friends_bp.route('/', methods=['POST'])
def add_friend():
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = sanitize_input(request.get_json())
        name = data.get('name')
        phone = data.get('phone')
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        if phone and not validate_phone(phone):
            return jsonify({'error': 'Invalid phone format'}), 400
        
        # Check if friend already exists
        existing = current_app.db.friends.find_one({
            'user_id': user_id,
            'name': name
        })
        
        if existing:
            return jsonify({'error': 'Friend already exists'}), 409
        
        friend_data = {
            'user_id': user_id,
            'name': name,
            'phone': phone,
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

@friends_bp.route('/<friend_id>', methods=['PUT'])
def update_friend(friend_id):
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = sanitize_input(request.get_json())
        name = data.get('name')
        phone = data.get('phone')
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        if phone and not validate_phone(phone):
            return jsonify({'error': 'Invalid phone format'}), 400
        
        result = current_app.db.friends.update_one(
            {'_id': ObjectId(friend_id), 'user_id': user_id},
            {'$set': {'name': name, 'phone': phone, 'updated_at': datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Friend not found'}), 404
        
        return jsonify({'message': 'Friend updated successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Update friend error: {e}')
        return jsonify({'error': 'Failed to update friend'}), 500

@friends_bp.route('/<friend_id>', methods=['DELETE'])
def delete_friend(friend_id):
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        result = current_app.db.friends.delete_one({
            '_id': ObjectId(friend_id),
            'user_id': user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Friend not found'}), 404
        
        return jsonify({'message': 'Friend deleted successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Delete friend error: {e}')
        return jsonify({'error': 'Failed to delete friend'}), 500