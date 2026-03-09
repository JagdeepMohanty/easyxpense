from flask import current_app
from datetime import datetime
from app.models.debt_model import Debt

def calculate_user_debts(user_id, group_id=None):
    query = {'user_id': user_id}
    if group_id:
        query['group_id'] = group_id
    
    expenses = list(current_app.db.expenses.find(query))
    settlements = list(current_app.db.settlements.find(query))
    
    return Debt.calculate_debts(expenses, settlements)

def record_settlement(user_id, from_user, to_user, amount):
    if amount <= 0:
        raise ValueError('Amount must be positive')
    
    settlement_data = {
        'user_id': user_id,
        'fromUser': from_user,
        'toUser': to_user,
        'amount': amount,
        'created_at': datetime.utcnow()
    }
    
    result = current_app.db.settlements.insert_one(settlement_data)
    return str(result.inserted_id)
