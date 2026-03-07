from datetime import datetime
from bson import ObjectId
import secrets
import string

class Group:
    def __init__(self, db):
        self.collection = db.groups
    
    @staticmethod
    def generate_code():
        """Generate unique group code"""
        return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    
    def get_group_by_id(self, group_id):
        """Get group by ID"""
        try:
            return self.collection.find_one({'_id': ObjectId(group_id) if isinstance(group_id, str) else group_id})
        except:
            return None
