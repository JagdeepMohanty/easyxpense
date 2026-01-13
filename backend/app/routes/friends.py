from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/friends', methods=['POST'])
def add_friend():
    current_app.logger.info('Adding new friend')
    data = request.get_json()
    current_app.logger.info(f'Friend data received: {data}')
    
    if not data:
        return jsonify({'success': False, 'error': 'Request body is required'}), 400
        
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    
    if not name or not email:
        return jsonify({'success': False, 'error': 'Name and email are required'}), 400
    
    if len(name) > 100:
        return jsonify({'success': False, 'error': 'Name too long (max 100 characters)'}), 400
    
    if '@' not in email or len(email) > 254:
        return jsonify({'success': False, 'error': 'Invalid email format'}), 400
    
    try:
        if not current_app.db:
            current_app.logger.error('Database connection not available for friends')
            return jsonify({'success': False, 'error': 'Database not available'}), 503
            
        friends_collection = current_app.db.friends
        current_app.logger.info('Checking for existing friend')
        
        # Check if friend already exists
        existing_friend = friends_collection.find_one({'email': email})
        if existing_friend:
            return jsonify({'success': False, 'error': 'Friend already exists'}), 400
        
        # Add friend
        friend_data = {
            'name': name,
            'email': email,
            'created_at': ObjectId().generation_time
        }
        
        current_app.logger.info(f'Inserting friend data: {friend_data}')
        result = friends_collection.insert_one(friend_data)
        current_app.logger.info(f'Friend inserted with ID: {result.inserted_id}')
        
        return jsonify({
            'success': True,
            'message': 'Friend added successfully',
            'data': {
                '_id': str(result.inserted_id),
                'name': name,
                'email': email
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Add friend error: {e}')
        return jsonify({'success': False, 'error': 'Failed to add friend'}), 500

@friends_bp.route('/friends', methods=['GET'])
def get_friends():
    try:
        if not current_app.db:
            return jsonify({'error': 'Database not available'}), 503
            
        friends_collection = current_app.db.friends
        friends = list(friends_collection.find({}).sort('name', 1))
        
        # Convert ObjectIds to strings
        for friend in friends:
            friend['_id'] = str(friend['_id'])
            if 'created_at' in friend:
                friend['created_at'] = friend['created_at'].isoformat()
        
        return jsonify(friends), 200
        
    except Exception as e:
        current_app.logger.error(f'Get friends error: {e}')
        return jsonify({'error': 'Failed to fetch friends'}), 500