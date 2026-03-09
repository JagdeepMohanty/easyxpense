from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.services import debt_service

debts_v1_bp = Blueprint('debts_v1', __name__)

@debts_v1_bp.route('/', methods=['GET'])
@token_required
def get_debts():
    try:
        group_id = request.args.get('group_id')
        debts = debt_service.calculate_user_debts(request.user_id, group_id)
        return jsonify({'debts': debts}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get debts error: {e}')
        return jsonify({'error': 'Failed to calculate debts'}), 500

@debts_v1_bp.route('/settle', methods=['POST'])
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
        except ValueError:
            return jsonify({'error': 'Invalid amount'}), 400
        
        settlement_id = debt_service.record_settlement(request.user_id, from_user, to_user, amount)
        
        return jsonify({
            'id': settlement_id,
            'message': 'Settlement recorded successfully'
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Settle debt error: {e}')
        return jsonify({'error': 'Failed to record settlement'}), 500
