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
            self.collection.create_index("participants")
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
            
            if rounded_amount > Decimal('1000000'):  # 10 lakh INR limit
                raise ValueError("Amount too large (max ₹10,00,000)")
            
            # Convert back to float for MongoDB storage
            return float(rounded_amount)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid amount: {amount}")
    
    def _validate_participants(self, participants, payer):
        """Validate participants list"""
        if not participants or len(participants) == 0:
            raise ValueError("At least one participant is required")
        
        if len(participants) > 50:  # Reasonable limit
            raise ValueError("Too many participants (max 50)")
        
        # Ensure payer is in participants
        if payer not in participants:
            participants.append(payer)
        
        return list(set(participants))  # Remove duplicates
    
    def create_expense(self, description, amount, payer, participants):
        """Create a new expense with comprehensive validation"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'Creating expense: {description}, amount: {amount}, payer: {payer}, participants: {participants}')
        
        # Validate amount
        validated_amount = self._validate_amount(amount)
        logger.info(f'Validated amount: {validated_amount}')
        
        # Validate participants
        validated_participants = self._validate_participants(participants, payer)
        logger.info(f'Validated participants: {validated_participants}')
        
        expense_data = {
            'description': description.strip(),
            'amount': validated_amount,
            'payer': payer.strip(),
            'participants': validated_participants,
            'date': datetime.utcnow(),
            'currency': 'INR'
        }
        
        logger.info(f'Inserting expense data: {expense_data}')
        
        try:
            result = self.collection.insert_one(expense_data)
            logger.info(f'MongoDB insert result: {result.inserted_id}')
            return result.inserted_id
        except Exception as e:
            logger.error(f'MongoDB insert failed: {e}')
            raise
    
    def get_all_expenses(self):
        """Get all expenses sorted by date (newest first)"""
        return list(self.collection.find({}).sort('date', -1))
    
    def get_expenses_by_participant(self, participant_name):
        """Get expenses where a specific person participated"""
        return list(self.collection.find({
            'participants': participant_name
        }).sort('date', -1))