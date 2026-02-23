from datetime import datetime

class Expense:
    @staticmethod
    def create(user_id, amount, description, category, friends=None, date=None):
        """Create expense document"""
        return {
            'user_id': user_id,
            'amount': float(amount),
            'description': description,
            'category': category,
            'friends': friends or [],
            'date': date or datetime.utcnow(),
            'created_at': datetime.utcnow()
        }
    
    @staticmethod
    def to_dict(expense):
        """Convert expense document to dict"""
        if not expense:
            return None
        return {
            'id': str(expense['_id']),
            'user_id': expense['user_id'],
            'amount': expense['amount'],
            'description': expense['description'],
            'category': expense['category'],
            'friends': expense.get('friends', []),
            'date': expense['date'].isoformat() if expense.get('date') else None,
            'created_at': expense['created_at'].isoformat() if expense.get('created_at') else None
        }
