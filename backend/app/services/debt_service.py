from datetime import datetime
from app.models.debt_model import Debt
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.settlement_repository import SettlementRepository

def calculate_user_debts(user_id, group_id=None):
    query = {'user_id': user_id}
    if group_id:
        query['group_id'] = group_id
    
    expenses = ExpenseRepository.find_many(query, limit=None)
    settlements = SettlementRepository.find_by_user(user_id)
    
    return Debt.calculate_debts(expenses, settlements)

async def async_calculate_user_debts(user_id, group_id=None):
    """Async version for better performance"""
    query = {'user_id': user_id}
    if group_id:
        query['group_id'] = group_id
    
    expenses = await ExpenseRepository.async_find_many(query, limit=None)
    settlements = await SettlementRepository.async_find_by_user(user_id)
    
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
    
    result = SettlementRepository.create(settlement_data)
    return str(result.inserted_id)

async def async_record_settlement(user_id, from_user, to_user, amount):
    """Async version for better performance"""
    if amount <= 0:
        raise ValueError('Amount must be positive')
    
    settlement_data = {
        'user_id': user_id,
        'fromUser': from_user,
        'toUser': to_user,
        'amount': amount,
        'created_at': datetime.utcnow()
    }
    
    result = await SettlementRepository.async_create(settlement_data)
    return str(result.inserted_id)
