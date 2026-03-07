from datetime import datetime
from bson import ObjectId

class GroupTransaction:
    def __init__(self, db):
        self.collection = db.group_transactions
    
    def create(self, group_id, paid_by, total_amount, split_type, splits, description='', category='Others', user_id=None):
        """Create a group transaction"""
        transaction = {
            'group_id': ObjectId(group_id) if isinstance(group_id, str) else group_id,
            'user_id': user_id,
            'paid_by': paid_by,
            'total_amount': float(total_amount),
            'split_type': split_type,
            'splits': splits,
            'description': description,
            'category': category,
            'created_at': datetime.utcnow()
        }
        result = self.collection.insert_one(transaction)
        return result.inserted_id
    
    def get_by_group(self, group_id, page=1, limit=20):
        """Get transactions for a group"""
        skip = (page - 1) * limit
        query = {'group_id': ObjectId(group_id) if isinstance(group_id, str) else group_id}
        
        total = self.collection.count_documents(query)
        transactions = list(self.collection.find(query).sort('created_at', -1).skip(skip).limit(limit))
        
        return {
            'data': transactions,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        }
    
    def get_member_balances(self, group_id):
        """Calculate member balances for a group"""
        query = {'group_id': ObjectId(group_id) if isinstance(group_id, str) else group_id}
        transactions = list(self.collection.find(query))
        
        balances = {}
        for txn in transactions:
            paid_by = txn['paid_by']
            if paid_by not in balances:
                balances[paid_by] = 0
            
            balances[paid_by] += txn['total_amount']
            
            for split in txn.get('splits', []):
                member = split['name']
                amount = split['amount']
                if member not in balances:
                    balances[member] = 0
                balances[member] -= amount
        
        return balances
