from flask import Blueprint, request, jsonify, current_app
from app.utils.sanitize import sanitize_string, sanitize_email
from app.middleware.auth import token_required
from bson import ObjectId

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/friends', methods=['POST'])
@token_required
def add_friend():
    current_app.logger.info('Adding new friend')
    user = request.current_user
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
        
        # Check if friend already exists for this user
        query = {'phone': phone, 'user_id': user['_id']}
        if group_id:
            query['group_id'] = group_id
        
        existing_friend = friends_collection.find_one(query)
        if existing_friend:
            return jsonify({'success': False, 'error': 'Friend already exists'}), 400
        
        # Add friend with user_id
        friend_data = {
            'user_id': user['_id'],
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
@token_required
def get_friends():
    user = request.current_user
    group_id = sanitize_string(request.args.get('group_id', ''), max_length=50) if request.args.get('group_id') else None
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    # Validate pagination params
    page = max(1, page)
    limit = min(max(1, limit), 50)  # Max 50 per page
    
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 503
            
        friends_collection = current_app.db.friends
        query = {'user_id': user['_id']}
        if group_id:
            query['group_id'] = group_id
        
        # Get total count
        total = friends_collection.count_documents(query)
        
        # Calculate pagination
        skip = (page - 1) * limit
        total_pages = (total + limit - 1) // limit
        
        # Fetch paginated data with field projection
        friends = list(friends_collection.find(
            query,
            {'name': 1, 'phone': 1, 'email': 1, 'created_at': 1}
        ).sort('name', 1).skip(skip).limit(limit))
        
        # Convert ObjectIds to strings
        for friend in friends:
            friend['_id'] = str(friend['_id'])
            if 'created_at' in friend:
                friend['created_at'] = friend['created_at'].isoformat()
        
        return jsonify({
            'data': friends,
            'page': page,
            'limit': limit,
            'total': total,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get friends error: {e}')
        return jsonify({'error': 'Failed to fetch friends'}), 500


@friends_bp.route('/friends/<friend_id>', methods=['PUT'])
@token_required
def update_friend(friend_id):
    user = request.current_user
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
        if current_app.db is None:
            return jsonify({'success': False, 'error': 'Database not available'}), 503
        
        friends_collection = current_app.db.friends
        
        # Update friend (only if owned by user)
        result = friends_collection.update_one(
            {'_id': ObjectId(friend_id), 'user_id': user['_id']},
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
@token_required
def delete_friend(friend_id):
    user = request.current_user
    try:
        if current_app.db is None:
            return jsonify({'success': False, 'error': 'Database not available'}), 503
        
        friends_collection = current_app.db.friends
        
        # Delete friend (only if owned by user)
        result = friends_collection.delete_one({'_id': ObjectId(friend_id), 'user_id': user['_id']})
        
        if result.deleted_count == 0:
            return jsonify({'success': False, 'error': 'Friend not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Friend deleted successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Delete friend error: {e}')
        return jsonify({'success': False, 'error': 'Failed to delete friend'}), 500
