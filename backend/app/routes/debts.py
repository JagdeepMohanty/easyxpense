from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from bson import ObjectId
from app.utils.money import paisa_to_rupees
from app.utils.debt_optimizer import calculate_optimized_debts

debts_bp = Blueprint('debts', __name__)

@debts_bp.route('/debts', methods=['GET'])
@token_required
def get_debts():
    user = request.current_user
    group_id = request.args.get('group_id')  # Optional filter
    optimize = request.args.get('optimize', 'true').lower() == 'true'  # Default: optimized
    
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 503
            
        expenses_collection = current_app.db.expenses
        settlements_collection = current_app.db.settlements
        
        # Build query for user and optional group filtering
        query = {'user_id': user['_id']}
        if group_id:
            query['group_id'] = group_id
        
        expenses = list(expenses_collection.find(query))
        settlements = list(settlements_collection.find(query))
        
        if optimize:
            # Use optimized algorithm
            optimized_settlements, balances = calculate_optimized_debts(expenses, settlements)
            
            # Convert to response format
            debts = []
            for settlement in optimized_settlements:
                debts.append({
                    'debtor': settlement['from'],
                    'creditor': settlement['to'],
                    'amount': paisa_to_rupees(settlement['amount_paisa'])
                })
            
            # Add balance summary
            balance_summary = {}
            for person, balance_paisa in balances.items():
                balance_summary[person] = paisa_to_rupees(balance_paisa)
            
            return jsonify({
                'debts': debts,
                'balances': balance_summary,
                'optimized': True
            }), 200
        else:
            # Legacy pairwise debt calculation
            return get_debts_legacy(query)
        
    except Exception as e:
        current_app.logger.error(f'Get debts error: {e}')
        return jsonify({'error': 'Failed to calculate debts'}), 500


def get_debts_legacy(query):
    """Legacy debt calculation (pairwise)"""
    try:
        friends_collection = current_app.db.friends
        expenses_collection = current_app.db.expenses
        settlements_collection = current_app.db.settlements
        
        friends = list(friends_collection.find(query))
        expenses = list(expenses_collection.find(query))
        settlements = list(settlements_collection.find(query))
        
        # Calculate debts using integer paisa
        debt_matrix_paisa = {}
        
        # Initialize debt matrix (in paisa)
        for friend in friends:
            friend_name = friend['name']
            debt_matrix_paisa[friend_name] = {}
            for other_friend in friends:
                if friend_name != other_friend['name']:
                    debt_matrix_paisa[friend_name][other_friend['name']] = 0
        
        # Process expenses
        for expense in expenses:
            payer = expense.get('payer')
            participant_shares = expense.get('participant_shares', [])
            
            if payer and participant_shares:
                # Use exact shares from expense
                for share in participant_shares:
                    participant = share['name']
                    share_paisa = share['share_paisa']
                    
                    if participant != payer and participant in debt_matrix_paisa:
                        if payer in debt_matrix_paisa[participant]:
                            debt_matrix_paisa[participant][payer] += share_paisa
        
        # Process settlements (subtract payments in paisa)
        for settlement in settlements:
            from_user = settlement.get('fromUser')
            to_user = settlement.get('toUser')
            amount_paisa = settlement.get('amount_paisa', 0)
            
            if from_user and to_user and amount_paisa > 0:
                if from_user in debt_matrix_paisa and to_user in debt_matrix_paisa[from_user]:
                    debt_matrix_paisa[from_user][to_user] -= amount_paisa
                    if debt_matrix_paisa[from_user][to_user] < 0:
                        debt_matrix_paisa[from_user][to_user] = 0
        
        # Convert to response format (rupees)
        debts = []
        for debtor, creditors in debt_matrix_paisa.items():
            for creditor, amount_paisa in creditors.items():
                if amount_paisa > 0:  # Any positive debt
                    debts.append({
                        'debtor': debtor,
                        'creditor': creditor,
                        'amount': paisa_to_rupees(amount_paisa)
                    })
        
        return jsonify(debts), 200
        
    except Exception as e:
        current_app.logger.error(f'Get debts legacy error: {e}')
        return jsonify({'error': 'Failed to calculate debts'}), 500
