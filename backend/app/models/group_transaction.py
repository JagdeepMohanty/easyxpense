from datetime import datetime
from bson import ObjectId

class GroupTransaction:
    def __init__(self, db):
        self.collection = db.group_transactions
        try:
            self.collection.create_index([("group_id", 1), ("created_at", -1)])
            self.collection.create_index("paid_by")
        except Exception:
            pass
    
    def create(self, group_id, paid_by, total_amount, split_type, splits, description, category, user_id):
        if split_type not in ['equal', 'percentage', 'custom']:
            raise ValueError("Invalid split_type")
        
        if split_type == 'percentage':
            total_pct = sum(s.get('percentage', 0) for s in splits)
            if abs(total_pct - 100) > 0.01:
                raise ValueError("Percentages must sum to 100")
        
        if split_type == 'custom':
            total_custom = sum(s.get('amount', 0) for s in splits)
            if abs(total_custom - total_amount) > 0.01:
                raise ValueError("Custom amounts must sum to total_amount")
        
        transaction = {
            'group_id': ObjectId(group_id),
            'paid_by': paid_by,
            'total_amount': total_amount,
            'split_type': split_type,
            'splits': splits,
            'description': description,
            'category': category,
            'user_id': user_id,
            'created_at': datetime.utcnow()
        }
        
        result = self.collection.insert_one(transaction)
        return result.inserted_id
    
    def get_by_group(self, group_id, page=1, limit=20):
        skip = (page - 1) * limit
        query = {'group_id': ObjectId(group_id)}
        
        total = self.collection.count_documents(query)
        transactions = list(self.collection.find(query).sort('created_at', -1).skip(skip).limit(limit))
        
        return {
            'data': transactions,
            'total': total,
            'page': page,
            'totalPages': (total + limit - 1) // limit
        }
    
    def get_member_balances(self, group_id):
        transactions = list(self.collection.find({'group_id': ObjectId(group_id)}))
        balances = {}
        
        for txn in transactions:
            paid_by = txn['paid_by']
            balances[paid_by] = balances.get(paid_by, 0) + txn['total_amount']
            
            for split in txn['splits']:
                member = split['user_id']
                amount = split['amount']
                balances[member] = balances.get(member, 0) - amount
        
        return balances
