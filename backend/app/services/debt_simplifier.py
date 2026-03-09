"""
Debt Simplification Engine for EasyXpense
Implements Splitwise-style debt optimization using greedy algorithm
"""

from collections import defaultdict
from app.extensions import db
from app.utils.logger import log_info

def simplify_group_debts(group_id):
    """
    Simplify debts within a group using greedy algorithm
    
    Args:
        group_id: Group ID to simplify debts for
        
    Returns:
        List of simplified transactions: [{"from": "A", "to": "B", "amount": 100}]
    """
    # Step 1: Build balance sheet
    balances = _calculate_balances(group_id)
    
    if not balances:
        return []
    
    # Step 2: Apply greedy settlement algorithm
    simplified = _greedy_settle(balances)
    
    log_info(f"Debt simplification", group_id=str(group_id), 
             original_debts=len(balances), simplified_transactions=len(simplified))
    
    return simplified

def _calculate_balances(group_id):
    """
    Calculate net balance for each member
    
    Returns:
        dict: {member_name: net_balance}
        Negative = owes money, Positive = should receive
    """
    balances = defaultdict(float)
    
    # Get all group transactions
    transactions = db.group_transactions.find({'group_id': group_id})
    
    for txn in transactions:
        paid_by = txn['paid_by']
        amount = txn['amount']
        split_among = txn.get('split_among', [])
        
        if not split_among:
            continue
        
        # Calculate split amount
        split_amount = amount / len(split_among)
        
        # Payer gets credited
        balances[paid_by] += amount
        
        # Each participant gets debited
        for member in split_among:
            balances[member] -= split_amount
    
    # Remove zero balances
    return {k: round(v, 2) for k, v in balances.items() if abs(v) > 0.01}

def _greedy_settle(balances):
    """
    Greedy algorithm to minimize transactions
    
    Algorithm:
    1. Find max creditor (person owed most)
    2. Find max debtor (person owes most)
    3. Settle min(creditor_amount, debtor_amount)
    4. Update balances
    5. Repeat until all balanced
    """
    result = []
    balance_copy = balances.copy()
    
    while True:
        # Find max creditor (positive balance)
        creditors = {k: v for k, v in balance_copy.items() if v > 0.01}
        if not creditors:
            break
        
        max_creditor = max(creditors, key=creditors.get)
        creditor_amount = creditors[max_creditor]
        
        # Find max debtor (negative balance)
        debtors = {k: v for k, v in balance_copy.items() if v < -0.01}
        if not debtors:
            break
        
        max_debtor = min(debtors, key=debtors.get)
        debtor_amount = abs(debtors[max_debtor])
        
        # Settle minimum amount
        settle_amount = min(creditor_amount, debtor_amount)
        settle_amount = round(settle_amount, 2)
        
        result.append({
            'from': max_debtor,
            'to': max_creditor,
            'amount': settle_amount
        })
        
        # Update balances
        balance_copy[max_creditor] -= settle_amount
        balance_copy[max_debtor] += settle_amount
        
        # Remove settled balances
        if abs(balance_copy[max_creditor]) < 0.01:
            del balance_copy[max_creditor]
        if abs(balance_copy[max_debtor]) < 0.01:
            del balance_copy[max_debtor]
    
    return result

def simplify_user_debts(user_id):
    """
    Simplify all debts for a specific user across all groups
    
    Args:
        user_id: User ID to simplify debts for
        
    Returns:
        dict: {group_id: [simplified_transactions]}
    """
    # Get all groups user is part of
    groups = db.groups.find({'members': {'$elemMatch': {'$eq': user_id}}})
    
    result = {}
    for group in groups:
        group_id = group['_id']
        simplified = simplify_group_debts(group_id)
        
        # Filter only transactions involving this user
        user_transactions = [
            txn for txn in simplified 
            if txn['from'] == user_id or txn['to'] == user_id
        ]
        
        if user_transactions:
            result[str(group_id)] = user_transactions
    
    return result

def calculate_debt_reduction(group_id):
    """
    Calculate how many transactions are saved by simplification
    
    Returns:
        dict: {
            'original_count': int,
            'simplified_count': int,
            'reduction_percentage': float
        }
    """
    balances = _calculate_balances(group_id)
    
    # Original: each person with negative balance needs to pay each with positive
    creditors = [k for k, v in balances.items() if v > 0.01]
    debtors = [k for k, v in balances.items() if v < -0.01]
    original_count = len(creditors) * len(debtors)
    
    # Simplified
    simplified = _greedy_settle(balances)
    simplified_count = len(simplified)
    
    reduction = 0
    if original_count > 0:
        reduction = round((1 - simplified_count / original_count) * 100, 1)
    
    return {
        'original_count': original_count,
        'simplified_count': simplified_count,
        'reduction_percentage': reduction
    }
