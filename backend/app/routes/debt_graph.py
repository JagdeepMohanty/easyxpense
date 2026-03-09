from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.utils.api_response import success_response, error_response
from bson import ObjectId
from collections import defaultdict

debt_graph_bp = Blueprint('debt_graph', __name__)

@debt_graph_bp.route('/groups/<group_id>/debt-graph', methods=['GET'])
@token_required
def get_debt_graph(group_id):
    """
    Get debt network graph for a group
    
    Returns nodes (users) and edges (debts) for visualization
    """
    try:
        if not ObjectId.is_valid(group_id):
            return error_response('Invalid group ID', 400)
        
        group_obj_id = ObjectId(group_id)
        
        # Get group
        group = current_app.db.groups.find_one({'_id': group_obj_id})
        if not group:
            return error_response('Group not found', 404)
        
        # Calculate net balances from group transactions
        balances = defaultdict(float)
        
        transactions = current_app.db.group_transactions.find({'group_id': group_obj_id})
        
        for txn in transactions:
            paid_by = txn['paid_by']
            amount = txn['amount']
            split_among = txn.get('split_among', [])
            
            if not split_among:
                continue
            
            split_amount = amount / len(split_among)
            
            # Payer gets credited
            balances[paid_by] += amount
            
            # Each participant gets debited
            for member in split_among:
                balances[member] -= split_amount
        
        # Subtract settlements
        settlements = current_app.db.settlements.find({'group_id': group_id})
        for settlement in settlements:
            from_user = settlement['fromUser']
            to_user = settlement['toUser']
            amount = settlement.get('amount', 0)
            
            balances[from_user] += amount
            balances[to_user] -= amount
        
        # Build nodes
        nodes = []
        members = group.get('members', [])
        for member in members:
            balance = balances.get(member, 0)
            nodes.append({
                'id': member,
                'name': member,
                'balance': round(balance, 2),
                'type': 'creditor' if balance > 0 else 'debtor' if balance < 0 else 'neutral'
            })
        
        # Build edges (debts)
        edges = []
        
        # Create debt edges from negative to positive balances
        creditors = {k: v for k, v in balances.items() if v > 0.01}
        debtors = {k: v for k, v in balances.items() if v < -0.01}
        
        for debtor, debt_amount in debtors.items():
            for creditor, credit_amount in creditors.items():
                if debt_amount >= -0.01 or credit_amount <= 0.01:
                    continue
                
                # Calculate amount to transfer
                transfer = min(abs(debt_amount), credit_amount)
                
                edges.append({
                    'source': debtor,
                    'target': creditor,
                    'amount': round(transfer, 2),
                    'label': f'₹{round(transfer, 2)}'
                })
                
                # Update balances
                debt_amount += transfer
                creditors[creditor] -= transfer
        
        return success_response({
            'nodes': nodes,
            'edges': edges,
            'group_name': group.get('name', 'Unknown')
        })
        
    except Exception as e:
        current_app.logger.error(f'Debt graph error: {e}')
        return error_response('Failed to generate debt graph', 500)

@debt_graph_bp.route('/debts/graph', methods=['GET'])
@token_required
def get_user_debt_graph():
    """
    Get debt network graph for current user across all groups
    """
    try:
        user_id = request.user_id
        
        # Get all user's friends
        friends = list(current_app.db.friends.find({'user_id': user_id}))
        friend_names = [f['name'] for f in friends]
        
        # Calculate balances
        balances = defaultdict(float)
        
        # From expenses
        expenses = current_app.db.expenses.find({'user_id': user_id})
        for expense in expenses:
            amount = expense['amount']
            friends_list = expense.get('friends', [])
            
            if not friends_list:
                continue
            
            split_amount = amount / (len(friends_list) + 1)
            
            # User paid, friends owe
            for friend in friends_list:
                balances[friend] -= split_amount
        
        # From settlements
        settlements = current_app.db.settlements.find({'user_id': user_id})
        for settlement in settlements:
            from_user = settlement['fromUser']
            to_user = settlement['toUser']
            amount = settlement.get('amount', 0)
            
            if from_user == user_id:
                balances[to_user] += amount
            elif to_user == user_id:
                balances[from_user] -= amount
        
        # Build nodes
        nodes = [{'id': 'You', 'name': 'You', 'balance': 0, 'type': 'self'}]
        
        for friend_name in friend_names:
            balance = balances.get(friend_name, 0)
            nodes.append({
                'id': friend_name,
                'name': friend_name,
                'balance': round(balance, 2),
                'type': 'creditor' if balance > 0 else 'debtor' if balance < 0 else 'neutral'
            })
        
        # Build edges
        edges = []
        for friend_name, balance in balances.items():
            if abs(balance) > 0.01:
                if balance < 0:  # Friend owes you
                    edges.append({
                        'source': friend_name,
                        'target': 'You',
                        'amount': round(abs(balance), 2),
                        'label': f'₹{round(abs(balance), 2)}'
                    })
                else:  # You owe friend
                    edges.append({
                        'source': 'You',
                        'target': friend_name,
                        'amount': round(balance, 2),
                        'label': f'₹{round(balance, 2)}'
                    })
        
        return success_response({
            'nodes': nodes,
            'edges': edges
        })
        
    except Exception as e:
        current_app.logger.error(f'User debt graph error: {e}')
        return error_response('Failed to generate debt graph', 500)
