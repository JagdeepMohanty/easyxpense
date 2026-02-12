from flask import Blueprint, request, jsonify, current_app
from app.models.group_transaction import GroupTransaction
from app.models.group import Group
from app.middleware.auth import token_required
from app.utils.sanitize import sanitize_string, sanitize_amount
from bson import ObjectId

group_transactions_bp = Blueprint('group_transactions', __name__)

@group_transactions_bp.route('/groups/<group_id>/transactions', methods=['POST'])
@token_required
def create_transaction(group_id):
    user = request.current_user
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Request body required'}), 400
    
    # Verify group ownership
    group_model = Group(current_app.db)
    group = group_model.get_group_by_id(group_id)
    if not group or str(group['user_id']) != str(user['_id']):
        return jsonify({'error': 'Group not found'}), 404
    
    paid_by = sanitize_string(data.get('paid_by', ''), max_length=100)
    total_amount = sanitize_amount(data.get('total_amount'))
    split_type = data.get('split_type', 'equal')
    splits = data.get('splits', [])
    description = sanitize_string(data.get('description', ''), max_length=200)
    category = sanitize_string(data.get('category', 'Others'), max_length=50)
    
    if not paid_by or not total_amount or not splits:
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        # Calculate split amounts
        if split_type == 'equal':
            per_person = total_amount / len(splits)
            for split in splits:
                split['amount'] = per_person
        elif split_type == 'percentage':
            for split in splits:
                split['amount'] = total_amount * (split['percentage'] / 100)
        
        txn_model = GroupTransaction(current_app.db)
        txn_id = txn_model.create(
            group_id=group_id,
            paid_by=paid_by,
            total_amount=total_amount,
            split_type=split_type,
            splits=splits,
            description=description,
            category=category,
            user_id=user['_id']
        )
        
        return jsonify({
            'success': True,
            'transaction_id': str(txn_id)
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Create transaction error: {e}')
        return jsonify({'error': 'Failed to create transaction'}), 500

@group_transactions_bp.route('/groups/<group_id>/transactions', methods=['GET'])
@token_required
def get_transactions(group_id):
    user = request.current_user
    page = int(request.args.get('page', 1))
    limit = min(int(request.args.get('limit', 20)), 50)
    
    # Verify group ownership
    group_model = Group(current_app.db)
    group = group_model.get_group_by_id(group_id)
    if not group or str(group['user_id']) != str(user['_id']):
        return jsonify({'error': 'Group not found'}), 404
    
    try:
        txn_model = GroupTransaction(current_app.db)
        result = txn_model.get_by_group(group_id, page, limit)
        
        for txn in result['data']:
            txn['_id'] = str(txn['_id'])
            txn['group_id'] = str(txn['group_id'])
            if 'created_at' in txn:
                txn['created_at'] = txn['created_at'].isoformat()
        
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f'Get transactions error: {e}')
        return jsonify({'error': 'Failed to fetch transactions'}), 500

@group_transactions_bp.route('/groups/<group_id>/balances', methods=['GET'])
@token_required
def get_balances(group_id):
    user = request.current_user
    
    # Verify group ownership
    group_model = Group(current_app.db)
    group = group_model.get_group_by_id(group_id)
    if not group or str(group['user_id']) != str(user['_id']):
        return jsonify({'error': 'Group not found'}), 404
    
    try:
        txn_model = GroupTransaction(current_app.db)
        balances = txn_model.get_member_balances(group_id)
        
        return jsonify({'balances': balances}), 200
    except Exception as e:
        current_app.logger.error(f'Get balances error: {e}')
        return jsonify({'error': 'Failed to fetch balances'}), 500
