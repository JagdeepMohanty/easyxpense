from flask import Blueprint, request, jsonify, current_app
import jwt
from bson import ObjectId
from datetime import datetime
import secrets
import string
from app.utils.sanitize import sanitize_input

groups_bp = Blueprint('groups', __name__)

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

def generate_group_code():
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))

@groups_bp.route('/', methods=['GET'])
def get_groups():
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        groups = list(current_app.db.groups.find({'user_id': user_id}).sort('created_at', -1))
        
        for group in groups:
            group['_id'] = str(group['_id'])
        
        return jsonify({'groups': groups}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get groups error: {e}')
        return jsonify({'error': 'Failed to fetch groups'}), 500

@groups_bp.route('/', methods=['POST'])
def create_group():
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = sanitize_input(request.get_json())
        name = data.get('name')
        members = data.get('members', [])
        
        if not name:
            return jsonify({'error': 'Group name is required'}), 400
        
        group_data = {
            'user_id': user_id,
            'name': name,
            'members': members,
            'group_code': generate_group_code(),
            'created_at': datetime.utcnow()
        }
        
        result = current_app.db.groups.insert_one(group_data)
        
        return jsonify({
            'id': str(result.inserted_id),
            'message': 'Group created successfully'
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Create group error: {e}')
        return jsonify({'error': 'Failed to create group'}), 500

@groups_bp.route('/<group_id>', methods=['DELETE'])
def delete_group(group_id):
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        result = current_app.db.groups.delete_one({
            '_id': ObjectId(group_id),
            'user_id': user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Group not found'}), 404
        
        return jsonify({'message': 'Group deleted successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Delete group error: {e}')
        return jsonify({'error': 'Failed to delete group'}), 500