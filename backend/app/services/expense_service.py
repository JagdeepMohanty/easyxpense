from datetime import datetime
from app.models.expense_model import Expense
from app.repositories.expense_repository import ExpenseRepository

def get_user_expenses(user_id, page=1, limit=10):
    total = ExpenseRepository.count_by_user(user_id)
    expenses = ExpenseRepository.find_by_user(user_id, page, limit)
    
    return {
        'data': [Expense.to_dict(e) for e in expenses],
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit
    }

async def async_get_user_expenses(user_id, page=1, limit=10):
    """Async version for better performance"""
    total = await ExpenseRepository.async_count_by_user(user_id)
    expenses = await ExpenseRepository.async_find_by_user(user_id, page, limit)
    
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
    result = ExpenseRepository.create(expense_data)
    
    return str(result.inserted_id)

async def async_create_expense(user_id, amount, description, category, friends, date=None):
    """Async version for better performance"""
    if amount <= 0:
        raise ValueError('Amount must be positive')
    
    expense_date = datetime.fromisoformat(date.replace('Z', '+00:00')) if date else datetime.utcnow()
    expense_data = Expense.create(user_id, amount, description, category, friends, expense_date)
    result = await ExpenseRepository.async_create(expense_data)
    
    return str(result.inserted_id)

def delete_expense(user_id, expense_id):
    result = ExpenseRepository.delete_by_id(expense_id, user_id)
    
    if result.deleted_count == 0:
        raise ValueError('Expense not found')
    
    return True

async def async_delete_expense(user_id, expense_id):
    """Async version for better performance"""
    result = await ExpenseRepository.async_delete_by_id(expense_id, user_id)
    
    if result.deleted_count == 0:
        raise ValueError('Expense not found')
    
    return True
