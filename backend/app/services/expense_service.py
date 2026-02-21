"""
Expense Service
Business logic for expense operations
"""
from datetime import datetime
from flask import current_app
from bson import ObjectId


class ExpenseService:
    """Service for handling expense operations"""
    
    @staticmethod
    def get_expenses(user_id, page=1, limit=10, search=None):
        """Get paginated list of expenses"""
        query = {'user_id': user_id}
        
        if search:
            query['description'] = {'$regex': search, '$options': 'i'}
        
        total = current_app.db.expenses.count_documents(query)
        expenses = list(
            current_app.db.expenses.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort('date', -1)
        )
        
        # Convert ObjectId to string
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
        
        return {
            'data': expenses,
            'total': total,
            'page': page,
            'totalPages': (total + limit - 1) // limit
        }
    
    @staticmethod
    def create_expense(user_id, amount, description, category, date=None, friends=None):
        """Create a new expense"""
        if not all([amount, description, category]):
            return None, 'Amount, description, and category are required'
        
        try:
            amount = float(amount)
            if amount <= 0:
                return None, 'Amount must be positive'
        except ValueError:
            return None, 'Invalid amount'
        
        expense_data = {
            'user_id': user_id,
            'amount': amount,
            'description': description,
            'category': category,
            'date': datetime.fromisoformat(date.replace('Z', '+00:00')) if date else datetime.utcnow(),
            'friends': friends or [],
            'created_at': datetime.utcnow()
        }
        
        result = current_app.db.expenses.insert_one(expense_data)
        
        return {
            'id': str(result.inserted_id),
            'message': 'Expense created successfully'
        }, None
    
    @staticmethod
    def update_expense(expense_id, user_id, **kwargs):
        """Update an existing expense"""
        expense = current_app.db.expenses.find_one({
            '_id': ObjectId(expense_id),
            'user_id': user_id
        })
        
        if not expense:
            return None, 'Expense not found'
        
        update_data = {}
        for key in ['amount', 'description', 'category', 'date', 'friends']:
            if key in kwargs and kwargs[key] is not None:
                update_data[key] = kwargs[key]
        
        if not update_data:
            return None, 'No fields to update'
        
        current_app.db.expenses.update_one(
            {'_id': ObjectId(expense_id)},
            {'$set': update_data}
        )
        
        return {'message': 'Expense updated successfully'}, None
    
    @staticmethod
    def delete_expense(expense_id, user_id):
        """Delete an expense"""
        result = current_app.db.expenses.delete_one({
            '_id': ObjectId(expense_id),
            'user_id': user_id
        })
        
        if result.deleted_count == 0:
            return None, 'Expense not found'
        
        return {'message': 'Expense deleted successfully'}, None
