from datetime import datetime

class Category:
    @staticmethod
    def create(name, user_id=None):
        """Create category document"""
        return {
            'name': name.lower().strip(),
            'user_id': user_id,  # None for system categories
            'created_at': datetime.utcnow()
        }
    
    @staticmethod
    def to_dict(category):
        """Convert category document to dict"""
        if not category:
            return None
        return {
            'id': str(category['_id']),
            'name': category['name'],
            'user_id': category.get('user_id'),
            'created_at': category['created_at'].isoformat() if category.get('created_at') else None
        }
