from datetime import datetime
from bson import ObjectId

class User:
    def __init__(self, name, email=None, phone=None, password=None):
        self.name = name
        self.email = email
        self.phone = phone
        self.password = password
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'password': self.password,
            'created_at': self.created_at
        }

class Friend:
    def __init__(self, user_id, name, phone=None, email=None):
        self.user_id = user_id
        self.name = name
        self.phone = phone
        self.email = email
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'created_at': self.created_at
        }

class Expense:
    def __init__(self, user_id, amount, description, category, date=None, friends=None):
        self.user_id = user_id
        self.amount = amount
        self.description = description
        self.category = category
        self.date = date or datetime.utcnow()
        self.friends = friends or []
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'amount': self.amount,
            'description': self.description,
            'category': self.category,
            'date': self.date,
            'friends': self.friends,
            'created_at': self.created_at
        }