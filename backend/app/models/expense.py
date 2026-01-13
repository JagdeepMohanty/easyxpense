from bson import ObjectId
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

class Expense:
    def __init__(self, db):
        self.collection = db.expenses
        # Create indexes for better performance
        try:
            self.collection.create_index([("payer", 1), ("participants", 1)])
            self.collection.create_index("date")
        except Exception:
            pass  # Indexes might already exist or DB not available
    
    def _validate_amount(self, amount):
        """Validate and format amount for INR currency"""
        try:
            # Convert to Decimal for precise currency handling
            decimal_amount = Decimal(str(amount))
            # Round to 2 decimal places (paise precision)
            rounded_amount = decimal_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
            if rounded_amount <= 0:
                raise ValueError("Amount must be positive")
            
            # Convert back to float for MongoDB storage
            return float(rounded_amount)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid amount: {amount}")
    
    def create_expense(self, description, amount, payer_id, participants):
        """Create a new expense with INR validation"""
        if isinstance(payer_id, str):
            payer_id = ObjectId(payer_id)
        
        # Validate amount
        validated_amount = self._validate_amount(amount)
        
        # Convert participant IDs to ObjectId
        participant_ids = []
        for p_id in participants:
            if isinstance(p_id, str):
                participant_ids.append(ObjectId(p_id))
            else:
                participant_ids.append(p_id)
        
        # Ensure payer is included in participants
        if payer_id not in participant_ids:
            participant_ids.append(payer_id)
        
        expense_data = {
            'description': description.strip(),
            'amount': validated_amount,
            'payer': payer_id,
            'participants': participant_ids,
            'date': datetime.utcnow(),
            'currency': 'INR'  # Explicitly store currency
        }
        result = self.collection.insert_one(expense_data)
        return result.inserted_id
    
    def get_user_expenses(self, user_id):
        """Get all expenses where user is payer or participant"""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        pipeline = [
            {
                '$match': {
                    '$or': [
                        {'payer': user_id},
                        {'participants': user_id}
                    ]
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'payer',
                    'foreignField': '_id',
                    'as': 'payer_info'
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'participants',
                    'foreignField': '_id',
                    'as': 'participants_info'
                }
            },
            {
                '$project': {
                    'description': 1,
                    'amount': 1,
                    'date': 1,
                    'currency': 1,
                    'payer': {'$arrayElemAt': ['$payer_info.name', 0]},
                    'participants': {
                        '$map': {
                            'input': '$participants_info',
                            'as': 'participant',
                            'in': {
                                '_id': '$$participant._id',
                                'name': '$$participant.name'
                            }
                        }
                    }
                }
            },
            {'$sort': {'date': -1}}
        ]
        return list(self.collection.aggregate(pipeline))
    
    def get_expenses_paid_by_user(self, payer_id):
        """Get expenses paid by specific user"""
        if isinstance(payer_id, str):
            payer_id = ObjectId(payer_id)
        return list(self.collection.find({'payer': payer_id}))
    
    def get_expenses_with_participant(self, payer_id, participant_id):
        """Get expenses paid by payer_id where participant_id is a participant"""
        if isinstance(payer_id, str):
            payer_id = ObjectId(payer_id)
        if isinstance(participant_id, str):
            participant_id = ObjectId(participant_id)
        
        return list(self.collection.find({
            'payer': payer_id,
            'participants': participant_id
        }))