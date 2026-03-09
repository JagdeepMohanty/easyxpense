from datetime import datetime
from bson import ObjectId

class Expense:
    @staticmethod
    def create(user_id, amount, description, category=None, category_id=None, friends=None, date=None, group_id=None, participants=None):
        """Create expense document with category_id support"""
        expense = {
            'user_id': user_id,
            'amount': float(amount),
            'description': description,
            'friends': friends or [],
            'date': date or datetime.utcnow(),
            'created_at': datetime.utcnow()
        }
        
        # Support both category_id (new) and category (legacy)
        if category_id:
            expense['category_id'] = ObjectId(category_id) if isinstance(category_id, str) else category_id
        if category:
            expense['category'] = category  # Keep for backward compatibility
        
        # Optional fields
        if group_id:
            expense['group_id'] = ObjectId(group_id) if isinstance(group_id, str) else group_id
        if participants:
            expense['participants'] = participants
        
        return expense
    
    @staticmethod
    def to_dict(expense):
        """Convert expense document to dict"""
        if not expense:
            return None
        result = {
            'id': str(expense['_id']),
            'user_id': expense['user_id'],
            'amount': expense['amount'],
            'description': expense['description'],
            'friends': expense.get('friends', []),
            'date': expense['date'].isoformat() if expense.get('date') else None,
            'created_at': expense['created_at'].isoformat() if expense.get('created_at') else None
        }
        
        # Include category_id if present
        if 'category_id' in expense:
            result['category_id'] = str(expense['category_id'])
        
        # Include legacy category if present
        if 'category' in expense:
            result['category'] = expense['category']
        
        # Include group_id if present
        if 'group_id' in expense:
            result['group_id'] = str(expense['group_id'])
        
        # Include participants if present
        if 'participants' in expense:
            result['participants'] = expense['participants']
        
        return result
