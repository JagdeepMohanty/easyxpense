from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.models.expense_model import Expense
from app.utils.helpers import sanitize_input
from datetime import datetime
from bson import ObjectId

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/', methods=['GET'])
@token_required
def get_expenses():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        query = {'user_id': request.user_id}
        
        total = current_app.db.expenses.count_documents(query)
        expenses = list(current_app.db.expenses.find(query)
                       .skip((page - 1) * limit)
                       .limit(limit)
                       .sort('date', -1))
        
        result = []
        for expense in expenses:
            result.append(Expense.to_dict(expense))
        
        return jsonify({
            'data': result,
            'total': total,
            'page': page,
            'totalPages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get expenses error: {e}')
        return jsonify({'error': 'Failed to fetch expenses'}), 500

@expenses_bp.route('/', methods=['POST'])
@token_required
def create_expense():
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
        
        expense_date = datetime.fromisoformat(date.replace('Z', '+00:00')) if date else datetime.utcnow()
        expense_data = Expense.create(request.user_id, amount, description, category, friends, expense_date)
        
        result = current_app.db.expenses.insert_one(expense_data)
        
        return jsonify({
            'id': str(result.inserted_id),
            'message': 'Expense created successfully'
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Create expense error: {e}')
        return jsonify({'error': 'Failed to create expense'}), 500

@expenses_bp.route('/<expense_id>', methods=['DELETE'])
@token_required
def delete_expense(expense_id):
    try:
        result = current_app.db.expenses.delete_one({
            '_id': ObjectId(expense_id),
            'user_id': request.user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Expense not found'}), 404
        
        return jsonify({'message': 'Expense deleted successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Delete expense error: {e}')
        return jsonify({'error': 'Failed to delete expense'}), 500
