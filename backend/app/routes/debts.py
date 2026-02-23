from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.models.debt_model import Debt
from datetime import datetime

debts_bp = Blueprint('debts', __name__)

@debts_bp.route('/', methods=['GET'])
@token_required
def get_debts():
    try:
        group_id = request.args.get('group_id')
        
        query = {'user_id': request.user_id}
        if group_id:
            query['group_id'] = group_id
        
        expenses = list(current_app.db.expenses.find(query))
        settlements = list(current_app.db.settlements.find(query))
        
        debts = Debt.calculate_debts(expenses, settlements)
        
        return jsonify({'debts': debts}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get debts error: {e}')
        return jsonify({'error': 'Failed to calculate debts'}), 500

@debts_bp.route('/settle', methods=['POST'])
@token_required
def settle_debt():
    try:
        data = request.get_json()
        from_user = data.get('fromUser')
        to_user = data.get('toUser')
        amount = data.get('amount')
        
        if not all([from_user, to_user, amount]):
            return jsonify({'error': 'fromUser, toUser, and amount are required'}), 400
        
        try:
            amount = float(amount)
            if amount <= 0:
                return jsonify({'error': 'Amount must be positive'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid amount'}), 400
        
        settlement_data = {
            'user_id': request.user_id,
            'fromUser': from_user,
            'toUser': to_user,
            'amount': amount,
            'created_at': datetime.utcnow()
        }
        
        result = current_app.db.settlements.insert_one(settlement_data)
        
        return jsonify({
            'id': str(result.inserted_id),
            'message': 'Settlement recorded successfully'
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Settle debt error: {e}')
        return jsonify({'error': 'Failed to record settlement'}), 500
