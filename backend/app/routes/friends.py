from flask import Blueprint, request, jsonify, current_app
from app.utils.sanitize import sanitize_string, sanitize_email
from bson import ObjectId

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/friends', methods=['POST'])
def add_friend():
    current_app.logger.info('Adding new friend')
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'Request body is required'}), 400
    
    # Sanitize inputs
    name = sanitize_string(data.get('name', ''), max_length=100)
    phone = sanitize_string(data.get('phone', ''), max_length=15)
    # Backward compatibility: accept email if phone not provided
    if not phone:
        phone = sanitize_email(data.get('email', ''))
    group_id = sanitize_string(data.get('group_id', ''), max_length=50) if data.get('group_id') else None
    
    if not name or not phone:
        return jsonify({'success': False, 'error': 'Valid name and phone number are required'}), 400
    
    # Validate phone number format (Indian: 10 digits starting with 6-9)
    if not phone.startswith('@'):  # Not an email (backward compat)
        import re
        if not re.match(r'^[6-9]\d{9}$', phone):
            return jsonify({'success': False, 'error': 'Invalid phone number format'}), 400
    
    try:
        if current_app.db is None:
            current_app.logger.error('Database connection not available for friends')
            return jsonify({'success': False, 'error': 'Database not available'}), 503
            
        friends_collection = current_app.db.friends
        
        # Check if friend already exists in this group
        query = {'phone': phone}
        if group_id:
            query['group_id'] = group_id
        
        existing_friend = friends_collection.find_one(query)
        if existing_friend:
            return jsonify({'success': False, 'error': 'Friend already exists'}), 400
        
        # Add friend
        friend_data = {
            'name': name,
            'phone': phone,
            'created_at': ObjectId().generation_time
        }
        
        if group_id:
            friend_data['group_id'] = group_id
        
        result = friends_collection.insert_one(friend_data)
        current_app.logger.info(f'Friend inserted with ID: {result.inserted_id}')
        
        return jsonify({
            'success': True,
            'message': 'Friend added successfully',
            'data': {
                '_id': str(result.inserted_id),
                'name': name,
                'phone': phone
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Add friend error: {e}')
        return jsonify({'success': False, 'error': 'Failed to add friend'}), 500

@friends_bp.route('/friends', methods=['GET'])
def get_friends():
    group_id = sanitize_string(request.args.get('group_id', ''), max_length=50) if request.args.get('group_id') else None
    
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 503
            
        friends_collection = current_app.db.friends
        query = {'group_id': group_id} if group_id else {}
        friends = list(friends_collection.find(query).sort('name', 1))
        
        # Convert ObjectIds to strings
        for friend in friends:
            friend['_id'] = str(friend['_id'])
            if 'created_at' in friend:
                friend['created_at'] = friend['created_at'].isoformat()
        
        return jsonify(friends), 200
        
    except Exception as e:
        current_app.logger.error(f'Get friends error: {e}')
        return jsonify({'error': 'Failed to fetch friends'}), 500


@friends_bp.route('/friends/<friend_id>', methods=['PUT'])
def update_friend(friend_id):
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'Request body is required'}), 400
    
    name = sanitize_string(data.get('name', ''), max_length=100)
    phone = sanitize_string(data.get('phone', ''), max_length=15)
    
    if not name or not phone:
        return jsonify({'success': False, 'error': 'Valid name and phone are required'}), 400
    
    # Validate phone format
    import re
    if not re.match(r'^[6-9]\d{9}$', phone):
        return jsonify({'success': False, 'error': 'Invalid phone number format'}), 400
    
    try:
        from bson import ObjectId
        if current_app.db is None:
            return jsonify({'success': False, 'error': 'Database not available'}), 503
        
        friends_collection = current_app.db.friends
        
        # Update friend
        result = friends_collection.update_one(
            {'_id': ObjectId(friend_id)},
            {'$set': {'name': name, 'phone': phone}}
        )
        
        if result.matched_count == 0:
            return jsonify({'success': False, 'error': 'Friend not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Friend updated successfully',
            'data': {'_id': friend_id, 'name': name, 'phone': phone}
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Update friend error: {e}')
        return jsonify({'success': False, 'error': 'Failed to update friend'}), 500

@friends_bp.route('/friends/<friend_id>', methods=['DELETE'])
def delete_friend(friend_id):
    try:
        from bson import ObjectId
        if current_app.db is None:
            return jsonify({'success': False, 'error': 'Database not available'}), 503
        
        friends_collection = current_app.db.friends
        
        # Delete friend
        result = friends_collection.delete_one({'_id': ObjectId(friend_id)})
        
        if result.deleted_count == 0:
            return jsonify({'success': False, 'error': 'Friend not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Friend deleted successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Delete friend error: {e}')
        return jsonify({'success': False, 'error': 'Failed to delete friend'}), 500
