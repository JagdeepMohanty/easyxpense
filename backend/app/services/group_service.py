"""
Group Service
Business logic for group operations
"""
import random
import string
from datetime import datetime
from flask import current_app
from bson import ObjectId


class GroupService:
    """Service for handling group operations"""
    
    @staticmethod
    def generate_group_code():
        """Generate a unique 6-character group code"""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    @staticmethod
    def get_groups(user_id):
        """Get all groups for a user"""
        # Get groups where user is a member
        groups = list(current_app.db.groups.find({
            'members': {'$elemMatch': {'user_id': user_id}}
        }))
        
        for group in groups:
            group['_id'] = str(group['_id'])
        
        return groups
    
    @staticmethod
    def create_group(user_id, name, members=None):
        """Create a new group"""
        if not name:
            return None, 'Group name is required'
        
        group_data = {
            'name': name,
            'members': members or [],
            'group_code': GroupService.generate_group_code(),
            'created_by': user_id,
            'created_at': datetime.utcnow()
        }
        
        result = current_app.db.groups.insert_one(group_data)
        
        return {
            'id': str(result.inserted_id),
            'group_code': group_data['group_code'],
            'message': 'Group created successfully'
        }, None
    
    @staticmethod
    def get_group(group_id, user_id):
        """Get a specific group"""
        group = current_app.db.groups.find_one({
            '_id': ObjectId(group_id),
            'members': {'$elemMatch': {'user_id': user_id}}
        })
        
        if not group:
            return None, 'Group not found'
        
        group['_id'] = str(group['_id'])
        return group, None
    
    @staticmethod
    def update_group(group_id, user_id, name=None):
        """Update a group"""
        group = current_app.db.groups.find_one({
            '_id': ObjectId(group_id),
            'created_by': user_id
        })
        
        if not group:
            return None, 'Group not found or unauthorized'
        
        update_data = {}
        if name:
            update_data['name'] = name
        
        if not update_data:
            return None, 'No fields to update'
        
        current_app.db.groups.update_one(
            {'_id': ObjectId(group_id)},
            {'$set': update_data}
        )
        
        return {'message': 'Group updated successfully'}, None
    
    @staticmethod
    def delete_group(group_id, user_id):
        """Delete a group"""
        result = current_app.db.groups.delete_one({
            '_id': ObjectId(group_id),
            'created_by': user_id
        })
        
        if result.deleted_count == 0:
            return None, 'Group not found or unauthorized'
        
        return {'message': 'Group deleted successfully'}, None
    
    @staticmethod
    def join_group(group_code, user_id):
        """Join a group by code"""
        group = current_app.db.groups.find_one({'group_code': group_code})
        
        if not group:
            return None, 'Group not found'
        
        # Check if user is already a member
        for member in group.get('members', []):
            if member.get('user_id') == user_id:
                return None, 'Already a member of this group'
        
        # Add user to group
        current_app.db.groups.update_one(
            {'_id': group['_id']},
            {'$push': {'members': {'user_id': user_id, 'joined_at': datetime.utcnow()}}}
        )
        
        return {'message': 'Successfully joined the group'}, None
