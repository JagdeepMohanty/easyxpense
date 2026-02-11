from flask import Blueprint, request, jsonify, current_app
from app.models.expense import Expense
from app.utils.sanitize import sanitize_string, sanitize_amount, sanitize_list
from app.middleware.auth import token_required
from bson import ObjectId

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/expenses', methods=['POST'])
@token_required
def create_expense():
    current_app.logger.info('Creating new expense')
    user = request.current_user
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'Request body is required'}), 400
    
    # Sanitize inputs
    description = sanitize_string(data.get('description', ''), max_length=200)
    amount = sanitize_amount(data.get('amount'))
    payer = sanitize_string(data.get('payer', ''), max_length=100)
    participants = sanitize_list(data.get('participants', []), max_items=50)
    group_id = sanitize_string(data.get('group_id', ''), max_length=50) if data.get('group_id') else None
    
    # Validation
    if not description:
        return jsonify({'success': False, 'error': 'Description is required'}), 400
    
    if amount is None:
        return jsonify({'success': False, 'error': 'Valid amount is required (max 1 crore)'}), 400
    
    if not payer:
        return jsonify({'success': False, 'error': 'Payer is required'}), 400
    
    if not participants or len(participants) == 0:
        return jsonify({'success': False, 'error': 'At least one participant is required'}), 400
    
    # Sanitize participant names
    participants = [sanitize_string(p, max_length=100) for p in participants if p]
    
    try:
        if current_app.db is None:
            current_app.logger.error('Database connection not available')
            return jsonify({'success': False, 'error': 'Database not available'}), 503
            
        expense_model = Expense(current_app.db)
        expense_id = expense_model.create_expense(
            description=description,
            amount=amount,
            payer=payer,
            participants=participants,
            group_id=group_id,
            user_id=user['_id']
        )
        
        current_app.logger.info(f'Expense created successfully with ID: {expense_id}')
        
        return jsonify({
            'success': True,
            'message': 'Expense created successfully',
            'data': {
                '_id': str(expense_id),
                'description': description,
                'amount': amount,
                'payer': payer,
                'participants': participants
            }
        }), 201
        
    except ValueError as e:
        current_app.logger.error(f'Validation error: {e}')
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Create expense error: {e}')
        return jsonify({'success': False, 'error': 'Failed to create expense'}), 500

@expenses_bp.route('/expenses', methods=['GET'])
@token_required
def get_expenses():
    user = request.current_user
    group_id = sanitize_string(request.args.get('group_id', ''), max_length=50) if request.args.get('group_id') else None
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 8))
    
    # Validate pagination params
    page = max(1, page)
    limit = min(max(1, limit), 50)
    
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 503
            
        expenses_collection = current_app.db.expenses
        query = {'user_id': user['_id']}
        if group_id:
            query['group_id'] = group_id
        
        # Get total count
        total = expenses_collection.count_documents(query)
        
        # Calculate pagination
        skip = (page - 1) * limit
        total_pages = (total + limit - 1) // limit
        
        # Fetch paginated data with field projection
        expenses = list(expenses_collection.find(
            query,
            {'description': 1, 'amount': 1, 'payer': 1, 'participants': 1, 'date': 1}
        ).sort('date', -1).skip(skip).limit(limit))
        
        # Convert ObjectIds to strings
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
            if 'date' in expense:
                expense['date'] = expense['date'].isoformat()
        
        return jsonify({
            'data': expenses,
            'page': page,
            'limit': limit,
            'total': total,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get expenses error: {e}')
        return jsonify({'error': 'Failed to fetch expenses'}), 500
