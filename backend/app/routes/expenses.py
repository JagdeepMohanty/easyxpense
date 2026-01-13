from flask import Blueprint, request, jsonify, current_app
from app.models.expense import Expense
from bson import ObjectId

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/expenses', methods=['POST'])
def create_expense():
    current_app.logger.info('Creating new expense')
    data = request.get_json()
    current_app.logger.info(f'Expense data received: {data}')
    
    if not data:
        return jsonify({'success': False, 'error': 'Request body is required'}), 400
    
    description = data.get('description', '').strip()
    amount = data.get('amount')
    payer = data.get('payer', '').strip()
    participants = data.get('participants', [])
    
    # Validation
    if not description:
        return jsonify({'success': False, 'error': 'Description is required'}), 400
    
    if len(description) > 200:
        return jsonify({'success': False, 'error': 'Description too long (max 200 characters)'}), 400
    
    if not payer:
        return jsonify({'success': False, 'error': 'Payer is required'}), 400
    
    if not participants or len(participants) == 0:
        return jsonify({'success': False, 'error': 'At least one participant is required'}), 400
    
    try:
        if not current_app.db:
            current_app.logger.error('Database connection not available')
            return jsonify({'success': False, 'error': 'Database not available'}), 503
            
        current_app.logger.info('Creating expense model instance')
        expense_model = Expense(current_app.db)
        
        current_app.logger.info('Calling expense_model.create_expense')
        expense_id = expense_model.create_expense(
            description=description,
            amount=amount,
            payer=payer,
            participants=participants
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
def get_expenses():
    try:
        if not current_app.db:
            return jsonify({'error': 'Database not available'}), 503
            
        expense_model = Expense(current_app.db)
        expenses = expense_model.get_all_expenses()
        
        # Convert ObjectIds to strings
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
            if 'date' in expense:
                expense['date'] = expense['date'].isoformat()
        
        return jsonify(expenses), 200
        
    except Exception as e:
        current_app.logger.error(f'Get expenses error: {e}')
        return jsonify({'error': 'Failed to fetch expenses'}), 500