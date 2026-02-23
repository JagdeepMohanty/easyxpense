class Debt:
    @staticmethod
    def calculate_debts(expenses, settlements):
        """Calculate debts from expenses and settlements"""
        debt_matrix = {}
        
        # Process expenses
        for expense in expenses:
            payer = expense.get('payer')
            friends = expense.get('friends', [])
            amount = expense.get('amount', 0)
            
            if payer and friends:
                share = amount / (len(friends) + 1)  # +1 for payer
                
                for friend in friends:
                    if friend != payer:
                        if friend not in debt_matrix:
                            debt_matrix[friend] = {}
                        if payer not in debt_matrix[friend]:
                            debt_matrix[friend][payer] = 0
                        debt_matrix[friend][payer] += share
        
        # Process settlements
        for settlement in settlements:
            from_user = settlement.get('fromUser')
            to_user = settlement.get('toUser')
            amount = settlement.get('amount', 0)
            
            if from_user and to_user and amount > 0:
                if from_user in debt_matrix and to_user in debt_matrix[from_user]:
                    debt_matrix[from_user][to_user] -= amount
                    if debt_matrix[from_user][to_user] < 0:
                        debt_matrix[from_user][to_user] = 0
        
        # Convert to list format
        debts = []
        for debtor, creditors in debt_matrix.items():
            for creditor, amount in creditors.items():
                if amount > 0:
                    debts.append({
                        'debtor': debtor,
                        'creditor': creditor,
                        'amount': round(amount, 2)
                    })
        
        return debts
