from flask import Blueprint, request, jsonify, current_app
from app.models.expense import Expense
from bson import ObjectId

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('', methods=['POST'])
def create_expense():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400
    
    description = data.get('description', '').strip()
    amount = data.get('amount')
    payer = data.get('payer', '').strip()
    participants = data.get('participants', [])
    
    # Validation
    if not description:
        return jsonify({'error': 'Description is required'}), 400
    
    if len(description) > 200:
        return jsonify({'error': 'Description too long (max 200 characters)'}), 400
    
    if not payer:
        return jsonify({'error': 'Payer is required'}), 400
    
    if not participants or len(participants) == 0:
        return jsonify({'error': 'At least one participant is required'}), 400
    
    try:
        if not current_app.db:
            return jsonify({'error': 'Database not available'}), 503
            
        expense_model = Expense(current_app.db)
        
        expense_id = expense_model.create_expense(
            description=description,
            amount=amount,
            payer=payer,
            participants=participants
        )
        
        return jsonify({
            '_id': str(expense_id),
            'description': description,
            'message': 'Expense created successfully'
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Create expense error: {e}')
        return jsonify({'error': 'Failed to create expense'}), 500

@expenses_bp.route('', methods=['GET'])
def get_expenses():
    try:
        if not current_app.db:
            return jsonify({'error': 'Database not available'}), 503
            
        expense_model = Expense(current_app.db)
        expenses = expense_model.get_all_expenses()
        
        # Convert ObjectIds to strings
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
            if 'participants' in expense:
                for participant in expense['participants']:
                    if '_id' in participant:
                        participant['_id'] = str(participant['_id'])
        
        return jsonify(expenses), 200
        
    except Exception as e:
        current_app.logger.error(f'Get expenses error: {e}')
        return jsonify({'error': 'Failed to fetch expenses'}), 500