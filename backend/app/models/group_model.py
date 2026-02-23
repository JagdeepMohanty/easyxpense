from datetime import datetime
import secrets
import string

class Group:
    @staticmethod
    def generate_code():
        """Generate unique group code"""
        return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    
    @staticmethod
    def create(user_id, name, members=None):
        """Create group document"""
        return {
            'user_id': user_id,
            'name': name,
            'members': members or [],
            'group_code': Group.generate_code(),
            'created_at': datetime.utcnow()
        }
    
    @staticmethod
    def to_dict(group):
        """Convert group document to dict"""
        if not group:
            return None
        return {
            'id': str(group['_id']),
            'user_id': group['user_id'],
            'name': group['name'],
            'members': group.get('members', []),
            'group_code': group.get('group_code'),
            'created_at': group['created_at'].isoformat() if group.get('created_at') else None
        }
