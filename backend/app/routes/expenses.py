from flask import Blueprint, request, jsonify, current_app
import jwt
from bson import ObjectId
from datetime import datetime
from app.utils.sanitize import sanitize_input

expenses_bp = Blueprint('expenses', __name__)

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

@expenses_bp.route('/', methods=['GET'])
def get_expenses():
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        query = {'user_id': user_id}
        
        total = current_app.db.expenses.count_documents(query)
        expenses = list(current_app.db.expenses.find(query)
                       .skip((page - 1) * limit)
                       .limit(limit)
                       .sort('date', -1))
        
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
        
        return jsonify({
            'data': expenses,
            'total': total,
            'page': page,
            'totalPages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get expenses error: {e}')
        return jsonify({'error': 'Failed to fetch expenses'}), 500

@expenses_bp.route('/', methods=['POST'])
def create_expense():
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = sanitize_input(request.get_json())
        amount = data.get('amount')
        description = data.get('description')
        category = data.get('category')
        date = data.get('date')
        friends = data.get('friends', [])
        
        if not all([amount, description, category]):
            return jsonify({'error': 'Amount, description, and category are required'}), 400
        
        try:
            amount = float(amount)
            if amount <= 0:
                return jsonify({'error': 'Amount must be positive'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid amount'}), 400
        
        expense_data = {
            'user_id': user_id,
            'amount': amount,
            'description': description,
            'category': category,
            'date': datetime.fromisoformat(date.replace('Z', '+00:00')) if date else datetime.utcnow(),
            'friends': friends,
            'created_at': datetime.utcnow()
        }
        
        result = current_app.db.expenses.insert_one(expense_data)
        
        return jsonify({
            'id': str(result.inserted_id),
            'message': 'Expense created successfully'
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Create expense error: {e}')
        return jsonify({'error': 'Failed to create expense'}), 500