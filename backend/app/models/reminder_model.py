from datetime import datetime
from bson import ObjectId

class Reminder:
    @staticmethod
    def create(user_id, title, amount, due_date, frequency='once', category=None, notes=None):
        """Create reminder document"""
        return {
            'user_id': user_id,
            'title': title,
            'amount': float(amount),
            'due_date': due_date if isinstance(due_date, datetime) else datetime.fromisoformat(due_date.replace('Z', '+00:00')),
            'frequency': frequency,  # 'once', 'daily', 'weekly', 'monthly', 'yearly'
            'category': category,
            'notes': notes,
            'is_active': True,
            'last_reminded': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
    
    @staticmethod
    def to_dict(reminder):
        """Convert reminder document to dict"""
        if not reminder:
            return None
        return {
            'id': str(reminder['_id']),
            'user_id': reminder['user_id'],
            'title': reminder['title'],
            'amount': reminder['amount'],
            'due_date': reminder['due_date'].isoformat() if reminder.get('due_date') else None,
            'frequency': reminder.get('frequency', 'once'),
            'category': reminder.get('category'),
            'notes': reminder.get('notes'),
            'is_active': reminder.get('is_active', True),
            'last_reminded': reminder['last_reminded'].isoformat() if reminder.get('last_reminded') else None,
            'created_at': reminder['created_at'].isoformat() if reminder.get('created_at') else None,
            'updated_at': reminder['updated_at'].isoformat() if reminder.get('updated_at') else None
        }
