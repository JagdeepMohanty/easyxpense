from bson import ObjectId
from datetime import datetime

class Settlement:
    def __init__(self, db):
        self.collection = db.settlements
        # Create indexes for better performance
        try:
            self.collection.create_index([("fromUser", 1), ("toUser", 1)])
            self.collection.create_index("date")
        except Exception:
            pass  # Indexes might already exist or DB not available
    
    def create_settlement(self, from_user_id, to_user_id, amount):
        """Create a new settlement"""
        if isinstance(from_user_id, str):
            from_user_id = ObjectId(from_user_id)
        if isinstance(to_user_id, str):
            to_user_id = ObjectId(to_user_id)
        
        settlement_data = {
            'fromUser': from_user_id,
            'toUser': to_user_id,
            'amount': float(amount),
            'date': datetime.utcnow()
        }
        result = self.collection.insert_one(settlement_data)
        return result.inserted_id
    
    def get_user_settlements(self, user_id):
        """Get all settlements where user is sender or receiver"""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        pipeline = [
            {
                '$match': {
                    '$or': [
                        {'fromUser': user_id},
                        {'toUser': user_id}
                    ]
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'fromUser',
                    'foreignField': '_id',
                    'as': 'from_user_info'
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'toUser',
                    'foreignField': '_id',
                    'as': 'to_user_info'
                }
            },
            {
                '$project': {
                    'amount': 1,
                    'date': 1,
                    'fromUser': {
                        '_id': {'$arrayElemAt': ['$from_user_info._id', 0]},
                        'name': {'$arrayElemAt': ['$from_user_info.name', 0]}
                    },
                    'toUser': {
                        '_id': {'$arrayElemAt': ['$to_user_info._id', 0]},
                        'name': {'$arrayElemAt': ['$to_user_info.name', 0]}
                    }
                }
            },
            {'$sort': {'date': -1}}
        ]
        return list(self.collection.aggregate(pipeline))
    
    def get_settlements_between_users(self, user1_id, user2_id):
        """Get settlements between two specific users"""
        if isinstance(user1_id, str):
            user1_id = ObjectId(user1_id)
        if isinstance(user2_id, str):
            user2_id = ObjectId(user2_id)
        
        return list(self.collection.find({
            '$or': [
                {'fromUser': user1_id, 'toUser': user2_id},
                {'fromUser': user2_id, 'toUser': user1_id}
            ]
        }))
    
    def get_settlements_from_user(self, from_user_id, to_user_id):
        """Get settlements from specific user to another"""
        if isinstance(from_user_id, str):
            from_user_id = ObjectId(from_user_id)
        if isinstance(to_user_id, str):
            to_user_id = ObjectId(to_user_id)
        
        return list(self.collection.find({
            'fromUser': from_user_id,
            'toUser': to_user_id
        }))