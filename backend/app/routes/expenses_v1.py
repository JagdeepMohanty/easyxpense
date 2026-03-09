from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.utils.helpers import sanitize_input
from app.services import expense_service

expenses_v1_bp = Blueprint('expenses_v1', __name__)

@expenses_v1_bp.route('/', methods=['GET'])
@token_required
def get_expenses():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        result = expense_service.get_user_expenses(request.user_id, page, limit)
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f'Get expenses error: {e}')
        return jsonify({'error': 'Failed to fetch expenses'}), 500

@expenses_v1_bp.route('/', methods=['POST'])
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
        except ValueError:
            return jsonify({'error': 'Invalid amount'}), 400
        
        expense_id = expense_service.create_expense(
            request.user_id, amount, description, category, friends, date
        )
        
        return jsonify({
            'id': expense_id,
            'message': 'Expense created successfully'
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Create expense error: {e}')
        return jsonify({'error': 'Failed to create expense'}), 500

@expenses_v1_bp.route('/<expense_id>', methods=['DELETE'])
@token_required
def delete_expense(expense_id):
    try:
        expense_service.delete_expense(request.user_id, expense_id)
        return jsonify({'message': 'Expense deleted successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        current_app.logger.error(f'Delete expense error: {e}')
        return jsonify({'error': 'Failed to delete expense'}), 500
