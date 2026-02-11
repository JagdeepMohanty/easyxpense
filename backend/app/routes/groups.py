from flask import Blueprint, request, jsonify, current_app
from app.models.group import Group
from app.middleware.auth import token_required
from bson import ObjectId

groups_bp = Blueprint('groups', __name__)

@groups_bp.route('/groups', methods=['POST'])
@token_required
def create_group():
    """Create new group"""
    user = request.current_user
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'Request body is required'}), 400
    
    name = data.get('name', '').strip()
    
    if not name:
        return jsonify({'success': False, 'error': 'Group name is required'}), 400
    
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 503
        
        group_model = Group(current_app.db)
        group_id, group_code = group_model.create_group(name, user['_id'])
        
        return jsonify({
            'success': True,
            'message': 'Group created successfully',
            'data': {
                '_id': str(group_id),
                'name': name,
                'group_code': group_code
            }
        }), 201
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Create group error: {e}')
        return jsonify({'success': False, 'error': 'Failed to create group'}), 500


@groups_bp.route('/groups', methods=['GET'])
@token_required
def get_groups():
    """Get all groups or find by code"""
    user = request.current_user
    group_code = request.args.get('code')
    
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 503
        
        group_model = Group(current_app.db)
        
        if group_code:
            # Find specific group by code (only if owned by user)
            group = group_model.get_group_by_code(group_code, user['_id'])
            if not group:
                return jsonify({'error': 'Group not found'}), 404
            
            group['_id'] = str(group['_id'])
            group['created_at'] = group['created_at'].isoformat()
            return jsonify(group), 200
        else:
            # Get all groups for user
            groups = group_model.get_all_groups(user['_id'])
            
            for group in groups:
                group['_id'] = str(group['_id'])
                group['created_at'] = group['created_at'].isoformat()
            
            return jsonify(groups), 200
        
    except Exception as e:
        current_app.logger.error(f'Get groups error: {e}')
        return jsonify({'error': 'Failed to fetch groups'}), 500


@groups_bp.route('/groups/<group_id>', methods=['DELETE'])
@token_required
def delete_group(group_id):
    """Delete group and all associated data"""
    user = request.current_user
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 503
        
        # Delete group (only if owned by user)
        group_model = Group(current_app.db)
        deleted = group_model.delete_group(group_id, user['_id'])
        
        if not deleted:
            return jsonify({'error': 'Group not found'}), 404
        
        # Delete associated data (only for this user)
        current_app.db.expenses.delete_many({'group_id': group_id, 'user_id': user['_id']})
        current_app.db.friends.delete_many({'group_id': group_id, 'user_id': user['_id']})
        current_app.db.settlements.delete_many({'group_id': group_id, 'user_id': user['_id']})
        
        return jsonify({
            'success': True,
            'message': 'Group and associated data deleted successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Delete group error: {e}')
        return jsonify({'error': 'Failed to delete group'}), 500
