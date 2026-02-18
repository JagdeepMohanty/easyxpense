from flask import Blueprint, request, jsonify, current_app
import jwt
from datetime import datetime, timedelta
from collections import defaultdict

analytics_bp = Blueprint('analytics', __name__)

def get_current_user():
    token = request.headers.get('Authorization')
    if not token or not token.startswith('Bearer '):
        return None
    
    try:
        token = token.split(' ')[1]
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

@analytics_bp.route('/monthly', methods=['GET'])
def get_monthly_summary():
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        months = int(request.args.get('months', 6))
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
        
        return jsonify({'data': result}), 200
        
    except Exception as e:
        current_app.logger.error(f'Monthly summary error: {e}')
        return jsonify({'error': 'Failed to fetch monthly summary'}), 500

@analytics_bp.route('/categories', methods=['GET'])
def get_category_breakdown():
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        expenses = list(current_app.db.expenses.find({'user_id': user_id}))
        
        category_data = defaultdict(float)
        for expense in expenses:
            category_data[expense.get('category', 'Other')] += expense['amount']
        
        result = [
            {'name': category, 'value': amount}
            for category, amount in category_data.items()
        ]
        
        result.sort(key=lambda x: x['value'], reverse=True)
        
        return jsonify({'data': result}), 200
        
    except Exception as e:
        current_app.logger.error(f'Category breakdown error: {e}')
        return jsonify({'error': 'Failed to fetch category breakdown'}), 500