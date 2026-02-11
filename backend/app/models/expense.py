from bson import ObjectId
from datetime import datetime
from app.utils.money import rupees_to_paisa, paisa_to_rupees, split_equally, validate_amount_paisa

class Expense:
    def __init__(self, db):
        self.collection = db.expenses
        try:
            self.collection.create_index("date")
            self.collection.create_index("payer")
            self.collection.create_index("participants")
        except Exception:
            pass
    
    def _validate_amount(self, amount):
        """Validate and convert amount to paisa (integer)"""
        try:
            # Convert to paisa
            amount_paisa = rupees_to_paisa(amount)
            # Validate range
            validate_amount_paisa(amount_paisa)
            return amount_paisa
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid amount: {amount}")
    
    def _validate_participants(self, participants, payer):
        """Validate participants list"""
        if not participants or len(participants) == 0:
            raise ValueError("At least one participant is required")
        
        if len(participants) > 50:
            raise ValueError("Too many participants (max 50)")
        
        # Ensure payer is in participants
        if payer not in participants:
            participants.append(payer)
        
        return list(set(participants))  # Remove duplicates
    
    def create_expense(self, description, amount, payer, participants, group_id=None, user_id=None):
        """Create expense with integer paisa storage"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'Creating expense: {description}, amount: {amount}, payer: {payer}')
        
        # Validate and convert amount to paisa
        amount_paisa = self._validate_amount(amount)
        logger.info(f'Amount in paisa: {amount_paisa}')
        
        # Validate participants
        validated_participants = self._validate_participants(participants, payer)
        logger.info(f'Validated participants: {validated_participants}')
        
        # Calculate shares in paisa
        shares_paisa = split_equally(amount_paisa, len(validated_participants))
        
        # Create participant shares
        participant_shares = []
        for i, participant in enumerate(validated_participants):
            participant_shares.append({
                'name': participant,
                'share_paisa': shares_paisa[i]
            })
        
        expense_data = {
            'user_id': user_id,
            'description': description.strip(),
            'amount_paisa': amount_paisa,  # Store as integer paisa
            'amount': paisa_to_rupees(amount_paisa),  # Also store rupees for backward compatibility
            'payer': payer.strip(),
            'participants': validated_participants,
            'participant_shares': participant_shares,  # Exact shares in paisa
            'date': datetime.utcnow(),
            'currency': 'INR'
        }
        
        # Add group_id if provided
        if group_id:
            expense_data['group_id'] = group_id
        
        logger.info(f'Inserting expense with amount_paisa: {amount_paisa}')
        
        try:
            result = self.collection.insert_one(expense_data)
            logger.info(f'Expense created with ID: {result.inserted_id}')
            return result.inserted_id
        except Exception as e:
            logger.error(f'MongoDB insert failed: {e}')
            raise
    
    def get_all_expenses(self, group_id=None):
        """Get all expenses sorted by date (newest first)"""
        query = {'group_id': group_id} if group_id else {}
        return list(self.collection.find(query).sort('date', -1))
    
    def get_expenses_by_participant(self, participant_name):
        """Get expenses where a specific person participated"""
        return list(self.collection.find({
            'participants': participant_name
        }).sort('date', -1))