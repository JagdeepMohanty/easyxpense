from flask import Blueprint, request, jsonify, current_app
from pydantic import ValidationError
from app.middleware.auth import token_required
from app.dto.expense_dto import ExpenseCreateDTO
from app.services import expense_service

expenses_v1_bp = Blueprint('expenses_v1', __name__)

@expenses_v1_bp.route('/', methods=['GET'])
@token_required
async def get_expenses():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        result = await expense_service.async_get_user_expenses(request.user_id, page, limit)
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f'Get expenses error: {e}')
        return jsonify({'error': 'Failed to fetch expenses'}), 500

@expenses_v1_bp.route('/', methods=['POST'])
@token_required
async def create_expense():
    try:
        dto = ExpenseCreateDTO(**request.get_json())
        
        expense_id = await expense_service.async_create_expense(
            request.user_id,
            dto.amount,
            dto.description,
            dto.category,
            dto.friends,
            dto.date
        )
        
        return jsonify({
            'id': expense_id,
            'message': 'Expense created successfully'
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': str(e.errors()[0]['msg'])}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Create expense error: {e}')
        return jsonify({'error': 'Failed to create expense'}), 500

@expenses_v1_bp.route('/<expense_id>', methods=['DELETE'])
@token_required
async def delete_expense(expense_id):
    try:
        await expense_service.async_delete_expense(request.user_id, expense_id)
        return jsonify({'message': 'Expense deleted successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        current_app.logger.error(f'Delete expense error: {e}')
        return jsonify({'error': 'Failed to delete expense'}), 500
