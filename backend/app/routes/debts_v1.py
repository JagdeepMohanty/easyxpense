from flask import Blueprint, request, jsonify, current_app
from pydantic import ValidationError
from app.middleware.auth import token_required
from app.dto.debt_dto import SettlementCreateDTO
from app.services import debt_service

debts_v1_bp = Blueprint('debts_v1', __name__)

@debts_v1_bp.route('/', methods=['GET'])
@token_required
async def get_debts():
    try:
        group_id = request.args.get('group_id')
        debts = await debt_service.async_calculate_user_debts(request.user_id, group_id)
        return jsonify({'debts': debts}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get debts error: {e}')
        return jsonify({'error': 'Failed to calculate debts'}), 500

@debts_v1_bp.route('/settle', methods=['POST'])
@token_required
async def settle_debt():
    try:
        dto = SettlementCreateDTO(**request.get_json())
        
        settlement_id = await debt_service.async_record_settlement(
            request.user_id,
            dto.fromUser,
            dto.toUser,
            dto.amount
        )
        
        return jsonify({
            'id': settlement_id,
            'message': 'Settlement recorded successfully'
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': str(e.errors()[0]['msg'])}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Settle debt error: {e}')
        return jsonify({'error': 'Failed to record settlement'}), 500
