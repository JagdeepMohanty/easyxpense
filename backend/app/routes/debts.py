from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId

debts_bp = Blueprint('debts', __name__)

@debts_bp.route('', methods=['GET'])
def get_debts():
    try:
        if not current_app.db:
            return jsonify({'error': 'Database not available'}), 503
            
        # Get all friends and expenses to calculate debts
        friends_collection = current_app.db.friends
        expenses_collection = current_app.db.expenses
        settlements_collection = current_app.db.settlements
        
        friends = list(friends_collection.find({}))
        expenses = list(expenses_collection.find({}))
        settlements = list(settlements_collection.find({}))
        
        debts = []
        
        for friend in friends:
            friend_id = str(friend['_id'])
            friend_name = friend['name']
            
            # Calculate net amount for this friend
            net_amount = 0.0
            
            # Calculate from expenses
            for expense in expenses:
                if 'participants' in expense and friend_id in expense.get('participants', []):
                    participant_count = len(expense['participants'])
                    if participant_count > 0:
                        share_amount = expense['amount'] / participant_count
                        
                        # If friend paid, they are owed
                        if expense.get('payer') == friend_name:
                            net_amount -= share_amount
                        else:
                            # Someone else paid, friend owes their share
                            net_amount += share_amount
            
            # Subtract settlements (payments made)
            for settlement in settlements:
                if settlement.get('fromUser') == friend_name:
                    net_amount -= settlement.get('amount', 0)
                elif settlement.get('toUser') == friend_name:
                    net_amount += settlement.get('amount', 0)
            
            # Round to 2 decimal places
            net_amount = round(net_amount, 2)
            
            # Only include if there's a debt
            if abs(net_amount) > 0.01:
                debts.append({
                    'friendId': friend_id,
                    'friendName': friend_name,
                    'amount': net_amount
                })
        
        return jsonify(debts), 200
        
    except Exception as e:
        current_app.logger.error(f'Get debts error: {e}')
        return jsonify({'error': 'Failed to calculate debts'}), 500