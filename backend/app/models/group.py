from bson import ObjectId
from datetime import datetime
import secrets

class Group:
    def __init__(self, db):
        self.collection = db.groups
        try:
            self.collection.create_index("group_code", unique=True)
            self.collection.create_index("created_at")
        except Exception:
            pass
    
    def _generate_group_code(self):
        """Generate unique 6-character group code"""
        while True:
            code = secrets.token_hex(3).upper()  # 6 chars
            if not self.collection.find_one({'group_code': code}):
                return code
    
    def create_group(self, name, user_id):
        """Create new group"""
        if not name or len(name.strip()) == 0:
            raise ValueError("Group name is required")
        
        if len(name) > 50:
            raise ValueError("Group name too long (max 50 characters)")
        
        group_code = self._generate_group_code()
        
        group_data = {
            'user_id': user_id,
            'name': name.strip(),
            'group_code': group_code,
            'created_at': datetime.utcnow()
        }
        
        result = self.collection.insert_one(group_data)
        return result.inserted_id, group_code
    
    def get_group_by_code(self, group_code, user_id):
        """Get group by code (only if owned by user)"""
        return self.collection.find_one({'group_code': group_code.upper(), 'user_id': user_id})
    
    def get_group_by_id(self, group_id):
        """Get group by ID"""
        return self.collection.find_one({'_id': ObjectId(group_id)})
    
    def get_all_groups(self, user_id):
        """Get all groups for user"""
        return list(self.collection.find({'user_id': user_id}).sort('created_at', -1))
    
    def delete_group(self, group_id, user_id):
        """Delete group (only if owned by user)"""
        result = self.collection.delete_one({'_id': ObjectId(group_id), 'user_id': user_id})
        return result.deleted_count > 0
