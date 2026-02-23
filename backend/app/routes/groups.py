from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.models.group_model import Group
from app.utils.helpers import sanitize_input
from bson import ObjectId

groups_bp = Blueprint('groups', __name__)

@groups_bp.route('/', methods=['GET'])
@token_required
def get_groups():
    try:
        groups = list(current_app.db.groups.find({'user_id': request.user_id}).sort('created_at', -1))
        
        result = []
        for group in groups:
            result.append(Group.to_dict(group))
        
        return jsonify({'groups': result}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get groups error: {e}')
        return jsonify({'error': 'Failed to fetch groups'}), 500

@groups_bp.route('/', methods=['POST'])
@token_required
def create_group():
    try:
        data = sanitize_input(request.get_json())
        name = data.get('name')
        members = data.get('members', [])
        
        if not name:
            return jsonify({'error': 'Group name is required'}), 400
        
        group_data = Group.create(request.user_id, name, members)
        result = current_app.db.groups.insert_one(group_data)
        
        return jsonify({
            'id': str(result.inserted_id),
            'message': 'Group created successfully'
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Create group error: {e}')
        return jsonify({'error': 'Failed to create group'}), 500

@groups_bp.route('/<group_id>', methods=['GET'])
@token_required
def get_group(group_id):
    try:
        group = current_app.db.groups.find_one({
            '_id': ObjectId(group_id),
            'user_id': request.user_id
        })
        
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        return jsonify({'group': Group.to_dict(group)}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get group error: {e}')
        return jsonify({'error': 'Failed to fetch group'}), 500

@groups_bp.route('/<group_id>', methods=['DELETE'])
@token_required
def delete_group(group_id):
    try:
        result = current_app.db.groups.delete_one({
            '_id': ObjectId(group_id),
            'user_id': request.user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Group not found'}), 404
        
        return jsonify({'message': 'Group deleted successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Delete group error: {e}')
        return jsonify({'error': 'Failed to delete group'}), 500
