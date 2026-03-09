"""
Spending Insights Service
Detects patterns and generates intelligent insights
"""
from datetime import datetime, timedelta
from collections import defaultdict
from app.extensions import db
from app.services.advanced_analytics_service import get_category_breakdown, get_monthly_spending

def generate_insights(user_id):
    """Generate intelligent spending insights"""
    insights = []
    
    # Get data
    now = datetime.utcnow()
    current_month = get_monthly_spending(user_id, now.year, now.month)
    prev_month_num = now.month - 1 if now.month > 1 else 12
    prev_year = now.year if now.month > 1 else now.year - 1
    previous_month = get_monthly_spending(user_id, prev_year, prev_month_num)
    
    categories = get_category_breakdown(user_id, days=30)
    
    # Insight 1: Month-over-month spending change
    if previous_month['total'] > 0:
        change_percent = ((current_month['total'] - previous_month['total']) / previous_month['total']) * 100
        
        if abs(change_percent) > 20:
            direction = "increased" if change_percent > 0 else "decreased"
            insights.append({
                'type': 'spending_change',
                'severity': 'high' if abs(change_percent) > 40 else 'medium',
                'message': f"Your spending {direction} by {abs(round(change_percent, 1))}% this month.",
                'value': round(change_percent, 1)
            })
    
    # Insight 2: Overspending categories
    if categories['categories']:
        avg_category_spend = categories['total'] / len(categories['categories'])
        
        for cat in categories['categories']:
            if cat['total'] > avg_category_spend * 1.5:
                insights.append({
                    'type': 'category_overspend',
                    'severity': 'medium',
                    'message': f"You spent {cat['percentage']}% of your budget on {cat['category']}.",
                    'category': cat['category'],
                    'amount': cat['total']
                })
    
    # Insight 3: Unusual large expenses
    start_date = datetime.utcnow() - timedelta(days=30)
    expenses = list(db.expenses.find({
        'user_id': user_id,
        'date': {'$gte': start_date}
    }).sort('amount', -1).limit(5))
    
    if expenses:
        avg_expense = sum(e['amount'] for e in expenses) / len(expenses)
        
        for expense in expenses[:3]:
            if expense['amount'] > avg_expense * 2:
                insights.append({
                    'type': 'large_expense',
                    'severity': 'low',
                    'message': f"Large expense detected: ₹{expense['amount']} on {expense.get('description', 'Unknown')}.",
                    'amount': expense['amount'],
                    'description': expense.get('description')
                })
                break
    
    # Insight 4: Spending spike detection
    daily_expenses = defaultdict(float)
    for expense in db.expenses.find({
        'user_id': user_id,
        'date': {'$gte': start_date}
    }):
        day = expense['date'].strftime('%Y-%m-%d')
        daily_expenses[day] += expense['amount']
    
    if daily_expenses:
        avg_daily = sum(daily_expenses.values()) / len(daily_expenses)
        
        for day, amount in daily_expenses.items():
            if amount > avg_daily * 3:
                insights.append({
                    'type': 'spending_spike',
                    'severity': 'medium',
                    'message': f"Spending spike detected on {day}: ₹{round(amount, 2)}.",
                    'date': day,
                    'amount': round(amount, 2)
                })
                break
    
    # Insight 5: Recurring costs detection
    recurring = detect_recurring_expenses(user_id)
    if recurring:
        total_recurring = sum(r['amount'] for r in recurring)
        insights.append({
            'type': 'recurring_costs',
            'severity': 'low',
            'message': f"You have {len(recurring)} recurring expenses totaling ₹{round(total_recurring, 2)}/month.",
            'count': len(recurring),
            'total': round(total_recurring, 2)
        })
    
    # Insight 6: Budget recommendations
    if current_month['total'] > 0:
        recommended_budget = current_month['total'] * 0.9  # 10% reduction
        insights.append({
            'type': 'budget_recommendation',
            'severity': 'low',
            'message': f"Consider setting a monthly budget of ₹{round(recommended_budget, 2)}.",
            'amount': round(recommended_budget, 2)
        })
    
    return insights[:5]  # Return top 5 insights

def detect_recurring_expenses(user_id, days=90):
    """Detect recurring expenses (subscriptions, rent, etc.)"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    expenses = list(db.expenses.find({
        'user_id': user_id,
        'date': {'$gte': start_date}
    }))
    
    # Group by description and amount
    expense_groups = defaultdict(list)
    for expense in expenses:
        key = (expense.get('description', '').lower(), round(expense['amount'], 0))
        expense_groups[key].append(expense['date'])
    
    recurring = []
    for (description, amount), dates in expense_groups.items():
        if len(dates) >= 2:
            # Check if dates are roughly monthly
            dates_sorted = sorted(dates)
            intervals = []
            for i in range(1, len(dates_sorted)):
                interval = (dates_sorted[i] - dates_sorted[i-1]).days
                intervals.append(interval)
            
            avg_interval = sum(intervals) / len(intervals) if intervals else 0
            
            # Monthly: 25-35 days, Weekly: 6-8 days
            if 25 <= avg_interval <= 35:
                recurring.append({
                    'description': description,
                    'amount': amount,
                    'frequency': 'monthly',
                    'occurrences': len(dates)
                })
            elif 6 <= avg_interval <= 8:
                recurring.append({
                    'description': description,
                    'amount': amount,
                    'frequency': 'weekly',
                    'occurrences': len(dates)
                })
    
    return recurring

def detect_anomalies(user_id):
    """Detect anomalous/suspicious expenses"""
    anomalies = []
    
    # Get last 60 days of expenses
    start_date = datetime.utcnow() - timedelta(days=60)
    expenses = list(db.expenses.find({
        'user_id': user_id,
        'date': {'$gte': start_date}
    }))
    
    if not expenses:
        return anomalies
    
    # Calculate statistics
    amounts = [e['amount'] for e in expenses]
    avg_amount = sum(amounts) / len(amounts)
    
    # Simple standard deviation
    variance = sum((x - avg_amount) ** 2 for x in amounts) / len(amounts)
    std_dev = variance ** 0.5
    
    # Detect outliers (3 standard deviations)
    threshold = avg_amount + (3 * std_dev)
    
    for expense in expenses:
        if expense['amount'] > threshold:
            anomalies.append({
                'type': 'unusually_large',
                'expense_id': str(expense['_id']),
                'amount': expense['amount'],
                'description': expense.get('description'),
                'date': expense['date'].strftime('%Y-%m-%d'),
                'severity': 'high' if expense['amount'] > threshold * 1.5 else 'medium',
                'message': f"Unusually large expense: ₹{expense['amount']} on {expense.get('description', 'Unknown')}."
            })
    
    # Detect category anomalies
    category_stats = defaultdict(list)
    for expense in expenses:
        category = expense.get('category', 'Uncategorized')
        category_stats[category].append(expense['amount'])
    
    for expense in expenses[-10:]:  # Check recent expenses
        category = expense.get('category', 'Uncategorized')
        if category in category_stats and len(category_stats[category]) > 3:
            cat_avg = sum(category_stats[category]) / len(category_stats[category])
            
            if expense['amount'] > cat_avg * 3:
                anomalies.append({
                    'type': 'category_anomaly',
                    'expense_id': str(expense['_id']),
                    'amount': expense['amount'],
                    'category': category,
                    'date': expense['date'].strftime('%Y-%m-%d'),
                    'severity': 'medium',
                    'message': f"Unusual {category} expense: ₹{expense['amount']} (avg: ₹{round(cat_avg, 2)})."
                })
    
    return anomalies[:5]  # Return top 5 anomalies
