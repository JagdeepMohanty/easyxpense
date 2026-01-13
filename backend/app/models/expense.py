from bson import ObjectId
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

class Expense:
    def __init__(self, db):
        self.collection = db.expenses
        # Create indexes for better performance
        try:
            self.collection.create_index("date")
            self.collection.create_index("payer")
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
    
    def create_expense(self, description, amount, payer, participants):
        """Create a new expense with INR validation"""
        # Validate amount
        validated_amount = self._validate_amount(amount)
        
        expense_data = {
            'description': description.strip(),
            'amount': validated_amount,
            'payer': payer,
            'participants': participants,
            'date': datetime.utcnow(),
            'currency': 'INR'
        }
        result = self.collection.insert_one(expense_data)
        return result.inserted_id
    
    def get_all_expenses(self):
        """Get all expenses sorted by date"""
        return list(self.collection.find({}).sort('date', -1))