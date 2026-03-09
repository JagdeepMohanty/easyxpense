from datetime import datetime, timedelta
from collections import defaultdict
from app.repositories.expense_repository import ExpenseRepository

def get_monthly_summary(user_id, months=6):
    start_date = datetime.utcnow() - timedelta(days=months * 30)
    expenses = ExpenseRepository.find_by_user_and_date_range(user_id, start_date, datetime.utcnow())
    
    monthly_data = defaultdict(float)
    for expense in expenses:
        month_key = expense['date'].strftime('%Y-%m')
        monthly_data[month_key] += expense['amount']
    
    result = []
    for i in range(months):
        date = datetime.utcnow() - timedelta(days=i * 30)
        month_key = date.strftime('%Y-%m')
        month_name = date.strftime('%b %Y')
        result.append({
            'month': month_name,
            'amount': monthly_data.get(month_key, 0)
        })
    
    result.reverse()
    return result

async def async_get_monthly_summary(user_id, months=6):
    """Async version for better performance"""
    start_date = datetime.utcnow() - timedelta(days=months * 30)
    expenses = await ExpenseRepository.async_find_by_user_and_date_range(user_id, start_date, datetime.utcnow())
    
    monthly_data = defaultdict(float)
    for expense in expenses:
        month_key = expense['date'].strftime('%Y-%m')
        monthly_data[month_key] += expense['amount']
    
    result = []
    for i in range(months):
        date = datetime.utcnow() - timedelta(days=i * 30)
        month_key = date.strftime('%Y-%m')
        month_name = date.strftime('%b %Y')
        result.append({
            'month': month_name,
            'amount': monthly_data.get(month_key, 0)
        })
    
    result.reverse()
    return result

def get_category_breakdown(user_id):
    expenses = ExpenseRepository.find_many({'user_id': user_id}, limit=None)
    
    category_data = defaultdict(float)
    for expense in expenses:
        category_data[expense.get('category', 'Other')] += expense['amount']
    
    result = [
        {'name': category, 'value': amount}
        for category, amount in category_data.items()
    ]
    
    result.sort(key=lambda x: x['value'], reverse=True)
    return result

async def async_get_category_breakdown(user_id):
    """Async version for better performance"""
    expenses = await ExpenseRepository.async_find_many({'user_id': user_id}, limit=None)
    
    category_data = defaultdict(float)
    for expense in expenses:
        category_data[expense.get('category', 'Other')] += expense['amount']
    
    result = [
        {'name': category, 'value': amount}
        for category, amount in category_data.items()
    ]
    
    result.sort(key=lambda x: x['value'], reverse=True)
    return result
