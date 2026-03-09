"""
Forecast Service
Predicts future spending using moving average and linear regression
"""
from datetime import datetime, timedelta
from app.extensions import db
from collections import defaultdict

def predict_monthly_spending(user_id, months_ahead=1):
    """Predict spending for next N months using moving average"""
    # Get last 6 months of data
    monthly_data = []
    now = datetime.utcnow()
    
    for i in range(6, 0, -1):
        month = now.month - i
        year = now.year
        
        while month <= 0:
            month += 12
            year -= 1
        
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        total = db.expenses.aggregate([
            {
                '$match': {
                    'user_id': user_id,
                    'date': {'$gte': start_date, '$lt': end_date}
                }
            },
            {
                '$group': {
                    '_id': None,
                    'total': {'$sum': '$amount'}
                }
            }
        ])
        
        result = list(total)
        amount = result[0]['total'] if result else 0
        monthly_data.append({
            'month': month,
            'year': year,
            'amount': amount
        })
    
    if not monthly_data or all(m['amount'] == 0 for m in monthly_data):
        return {
            'predicted_amount': 0,
            'confidence': 'low',
            'method': 'insufficient_data'
        }
    
    # Simple moving average (last 3 months)
    recent_months = [m['amount'] for m in monthly_data[-3:] if m['amount'] > 0]
    if recent_months:
        moving_avg = sum(recent_months) / len(recent_months)
    else:
        moving_avg = sum(m['amount'] for m in monthly_data) / len(monthly_data)
    
    # Linear regression for trend
    amounts = [m['amount'] for m in monthly_data]
    n = len(amounts)
    x_values = list(range(n))
    
    # Calculate slope
    x_mean = sum(x_values) / n
    y_mean = sum(amounts) / n
    
    numerator = sum((x_values[i] - x_mean) * (amounts[i] - y_mean) for i in range(n))
    denominator = sum((x_values[i] - x_mean) ** 2 for i in range(n))
    
    slope = numerator / denominator if denominator != 0 else 0
    intercept = y_mean - slope * x_mean
    
    # Predict next month
    predicted = intercept + slope * (n + months_ahead - 1)
    
    # Weighted average: 70% moving average, 30% linear regression
    final_prediction = (moving_avg * 0.7) + (predicted * 0.3)
    
    # Calculate confidence based on variance
    variance = sum((a - y_mean) ** 2 for a in amounts) / n
    std_dev = variance ** 0.5
    coefficient_of_variation = (std_dev / y_mean) if y_mean > 0 else 1
    
    if coefficient_of_variation < 0.2:
        confidence = 'high'
    elif coefficient_of_variation < 0.5:
        confidence = 'medium'
    else:
        confidence = 'low'
    
    return {
        'predicted_amount': round(max(0, final_prediction), 2),
        'moving_average': round(moving_avg, 2),
        'trend_prediction': round(max(0, predicted), 2),
        'confidence': confidence,
        'trend': 'increasing' if slope > 0 else 'decreasing' if slope < 0 else 'stable',
        'historical_data': monthly_data,
        'method': 'hybrid'
    }

def predict_category_spending(user_id, category, months_ahead=1):
    """Predict spending for specific category"""
    # Get last 6 months for this category
    monthly_data = []
    now = datetime.utcnow()
    
    for i in range(6, 0, -1):
        month = now.month - i
        year = now.year
        
        while month <= 0:
            month += 12
            year -= 1
        
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        total = db.expenses.aggregate([
            {
                '$match': {
                    'user_id': user_id,
                    'category': category,
                    'date': {'$gte': start_date, '$lt': end_date}
                }
            },
            {
                '$group': {
                    '_id': None,
                    'total': {'$sum': '$amount'}
                }
            }
        ])
        
        result = list(total)
        amount = result[0]['total'] if result else 0
        monthly_data.append(amount)
    
    if not monthly_data or all(a == 0 for a in monthly_data):
        return 0
    
    # Simple moving average
    recent = [a for a in monthly_data[-3:] if a > 0]
    return round(sum(recent) / len(recent), 2) if recent else 0

def get_spending_forecast_breakdown(user_id):
    """Get forecast breakdown by category"""
    from app.services.advanced_analytics_service import get_category_breakdown
    
    categories = get_category_breakdown(user_id, days=30)
    
    forecast_breakdown = []
    for cat in categories['categories']:
        predicted = predict_category_spending(user_id, cat['category'])
        forecast_breakdown.append({
            'category': cat['category'],
            'current_month': cat['total'],
            'predicted_next_month': predicted,
            'change': round(predicted - cat['total'], 2)
        })
    
    return {
        'categories': forecast_breakdown,
        'total_predicted': round(sum(c['predicted_next_month'] for c in forecast_breakdown), 2)
    }
