from flask import current_app
from datetime import datetime, timedelta
from collections import defaultdict

def get_monthly_summary(user_id, months=6):
    start_date = datetime.utcnow() - timedelta(days=months * 30)
    
    expenses = list(current_app.db.expenses.find({
        'user_id': user_id,
        'date': {'$gte': start_date}
    }))
    
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
    expenses = list(current_app.db.expenses.find({'user_id': user_id}))
    
    category_data = defaultdict(float)
    for expense in expenses:
        category_data[expense.get('category', 'Other')] += expense['amount']
    
    result = [
        {'name': category, 'value': amount}
        for category, amount in category_data.items()
    ]
    
    result.sort(key=lambda x: x['value'], reverse=True)
    return result
