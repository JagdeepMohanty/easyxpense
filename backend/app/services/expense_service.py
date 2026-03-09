from flask import current_app
from datetime import datetime
from bson import ObjectId
from app.models.expense_model import Expense

def get_user_expenses(user_id, page=1, limit=10):
    query = {'user_id': user_id}
    total = current_app.db.expenses.count_documents(query)
    expenses = list(current_app.db.expenses.find(query)
                   .skip((page - 1) * limit)
                   .limit(limit)
                   .sort('date', -1))
    
    return {
        'data': [Expense.to_dict(e) for e in expenses],
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit
    }

def create_expense(user_id, amount, description, category, friends, date=None):
    if amount <= 0:
        raise ValueError('Amount must be positive')
    
    expense_date = datetime.fromisoformat(date.replace('Z', '+00:00')) if date else datetime.utcnow()
    expense_data = Expense.create(user_id, amount, description, category, friends, expense_date)
    result = current_app.db.expenses.insert_one(expense_data)
    
    return str(result.inserted_id)

def delete_expense(user_id, expense_id):
    result = current_app.db.expenses.delete_one({
        '_id': ObjectId(expense_id),
        'user_id': user_id
    })
    
    if result.deleted_count == 0:
        raise ValueError('Expense not found')
    
    return True
