from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from bson import ObjectId
from datetime import datetime
from app.utils.money import rupees_to_paisa, paisa_to_rupees, validate_amount_paisa

settlements_bp = Blueprint('settlements', __name__)

@settlements_bp.route('/settlements', methods=['POST'])
@token_required
def create_settlement():
    current_app.logger.info('Creating new settlement')
    user = request.current_user
    data = request.get_json()
    current_app.logger.info(f'Settlement data received: {data}')
    
    if not data:
        return jsonify({'success': False, 'error': 'Request body is required'}), 400
        
    from_user = data.get('fromUser', '').strip()
    to_user = data.get('toUser', '').strip()
    amount = data.get('amount')
    group_id = data.get('group_id')  # Optional group_id
    
    # Validation
    if not from_user or not to_user:
        return jsonify({'success': False, 'error': 'From user and to user are required'}), 400
    
    if from_user == to_user:
        return jsonify({'success': False, 'error': 'Cannot settle with yourself'}), 400
    
    try:
        # Convert and validate amount
        amount_paisa = rupees_to_paisa(amount)
        validate_amount_paisa(amount_paisa)
    except (TypeError, ValueError) as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 503
            
        settlements_collection = current_app.db.settlements
        
        settlement_data = {
            'user_id': user['_id'],
            'fromUser': from_user,
            'toUser': to_user,
            'amount_paisa': amount_paisa,  # Store as integer paisa
            'amount': paisa_to_rupees(amount_paisa),  # Also store rupees for backward compatibility
            'date': datetime.utcnow(),
            'currency': 'INR'
        }
        
        # Add group_id if provided
        if group_id:
            settlement_data['group_id'] = group_id
        
        result = settlements_collection.insert_one(settlement_data)
        
        return jsonify({
            'success': True,
            'message': 'Settlement created successfully',
            'data': {
                '_id': str(result.inserted_id),
                'fromUser': from_user,
                'toUser': to_user,
                'amount': paisa_to_rupees(amount_paisa)
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Create settlement error: {e}')
        return jsonify({'success': False, 'error': 'Failed to create settlement'}), 500

@settlements_bp.route('/settlements', methods=['GET'])
@token_required
def get_settlements():
    user = request.current_user
    group_id = request.args.get('group_id')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    # Validate pagination params
    page = max(1, page)
    limit = min(max(1, limit), 50)
    
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 503
            
        settlements_collection = current_app.db.settlements
        query = {'user_id': user['_id']}
        if group_id:
            query['group_id'] = group_id
        
        # Get total count
        total = settlements_collection.count_documents(query)
        
        # Calculate pagination
        skip = (page - 1) * limit
        total_pages = (total + limit - 1) // limit
        
        # Fetch paginated data with field projection
        settlements = list(settlements_collection.find(
            query,
            {'fromUser': 1, 'toUser': 1, 'amount': 1, 'date': 1}
        ).sort('date', -1).skip(skip).limit(limit))
        
        # Convert ObjectIds to strings and format dates
        for settlement in settlements:
            settlement['_id'] = str(settlement['_id'])
            if 'date' in settlement:
                settlement['date'] = settlement['date'].isoformat()
        
        return jsonify({
            'data': settlements,
            'page': page,
            'limit': limit,
            'total': total,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get settlements error: {e}')
        return jsonify({'error': 'Failed to fetch settlements'}), 500
