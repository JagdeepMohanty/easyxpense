from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('', methods=['POST'])
def add_friend():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400
        
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    
    if not name or not email:
        return jsonify({'error': 'Name and email are required'}), 400
    
    try:
        if not current_app.db:
            return jsonify({'error': 'Database not available'}), 503
            
        friends_collection = current_app.db.friends
        
        # Check if friend already exists
        existing_friend = friends_collection.find_one({'email': email})
        if existing_friend:
            return jsonify({'error': 'Friend already exists'}), 400
        
        # Add friend
        friend_data = {
            'name': name,
            'email': email,
            'created_at': ObjectId().generation_time
        }
        
        result = friends_collection.insert_one(friend_data)
        
        return jsonify({
            '_id': str(result.inserted_id),
            'name': name,
            'email': email,
            'message': 'Friend added successfully'
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Add friend error: {e}')
        return jsonify({'error': 'Failed to add friend'}), 500

@friends_bp.route('', methods=['GET'])
def get_friends():
    try:
        if not current_app.db:
            return jsonify({'error': 'Database not available'}), 503
            
        friends_collection = current_app.db.friends
        friends = list(friends_collection.find({}))
        
        # Convert ObjectIds to strings
        for friend in friends:
            friend['_id'] = str(friend['_id'])
        
        return jsonify(friends), 200
        
    except Exception as e:
        current_app.logger.error(f'Get friends error: {e}')
        return jsonify({'error': 'Failed to fetch friends'}), 500