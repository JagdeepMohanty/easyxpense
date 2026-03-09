from datetime import datetime
from bson import ObjectId
from app.models.expense_model import Expense
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.category_repository import CategoryRepository
from app.extensions import mongo_client, async_mongo_client, db, async_db
from app.utils.logger import log_info, log_error

def create_expense_with_transaction(user_id, amount, description, category, friends, date=None, group_id=None):
    """
    Create expense with MongoDB transaction for data consistency
    
    Steps:
    1. Find or create category
    2. Insert expense with category_id
    3. Calculate splits
    4. Update debts collection
    5. Update group totals (if group_id provided)
    
    If any step fails, transaction is rolled back
    """
    if amount <= 0:
        raise ValueError('Amount must be positive')
    
    expense_date = datetime.fromisoformat(date.replace('Z', '+00:00')) if date else datetime.utcnow()
    
    # Start MongoDB session and transaction
    with mongo_client.start_session() as session:
        with session.start_transaction():
            try:
                # Step 1: Find or create category
                category_doc = CategoryRepository.find_or_create(category, user_id)
                category_id = category_doc['_id']
                
                log_info(f"Transaction: Category resolved", category_id=str(category_id), category_name=category)
                
                # Step 2: Create expense with category_id
                expense_data = Expense.create(
                    user_id=user_id,
                    amount=amount,
                    description=description,
                    category=category,  # Keep for backward compatibility
                    category_id=category_id,
                    friends=friends,
                    date=expense_date,
                    group_id=group_id
                )
                
                result = db.expenses.insert_one(expense_data, session=session)
                expense_id = result.inserted_id
                
                log_info(f"Transaction: Expense created", expense_id=str(expense_id))
                
                # Step 3: Calculate splits
                num_people = len(friends) + 1  # +1 for the user
                split_amount = amount / num_people
                
                # Step 4: Update debts collection
                for friend in friends:
                    debt_data = {
                        'debtor_id': friend,
                        'creditor_id': user_id,
                        'amount': split_amount,
                        'expense_id': expense_id,
                        'created_at': datetime.utcnow()
                    }
                    db.debts.insert_one(debt_data, session=session)
                
                log_info(f"Transaction: Debts created", count=len(friends))
                
                # Step 5: Update group totals (if group_id provided)
                if group_id:
                    db.groups.update_one(
                        {'_id': ObjectId(group_id)},
                        {
                            '$inc': {'total_expenses': amount},
                            '$set': {'updated_at': datetime.utcnow()}
                        },
                        session=session
                    )
                    log_info(f"Transaction: Group totals updated", group_id=group_id)
                
                # Commit transaction
                session.commit_transaction()
                log_info(f"Transaction: Committed successfully", expense_id=str(expense_id))
                
                return str(expense_id)
                
            except Exception as e:
                # Transaction automatically aborted on exception
                log_error(f"Transaction: Failed and rolled back", error=str(e))
                session.abort_transaction()
                raise

async def async_create_expense_with_transaction(user_id, amount, description, category, friends, date=None, group_id=None):
    """
    Async version: Create expense with MongoDB transaction
    """
    if amount <= 0:
        raise ValueError('Amount must be positive')
    
    expense_date = datetime.fromisoformat(date.replace('Z', '+00:00')) if date else datetime.utcnow()
    
    # Start async MongoDB session and transaction
    async with await async_mongo_client.start_session() as session:
        async with session.start_transaction():
            try:
                # Step 1: Find or create category
                category_doc = await CategoryRepository.async_find_or_create(category, user_id)
                category_id = category_doc['_id']
                
                log_info(f"Async Transaction: Category resolved", category_id=str(category_id))
                
                # Step 2: Create expense with category_id
                expense_data = Expense.create(
                    user_id=user_id,
                    amount=amount,
                    description=description,
                    category=category,
                    category_id=category_id,
                    friends=friends,
                    date=expense_date,
                    group_id=group_id
                )
                
                result = await async_db.expenses.insert_one(expense_data, session=session)
                expense_id = result.inserted_id
                
                log_info(f"Async Transaction: Expense created", expense_id=str(expense_id))
                
                # Step 3: Calculate splits
                num_people = len(friends) + 1
                split_amount = amount / num_people
                
                # Step 4: Update debts collection
                debt_operations = []
                for friend in friends:
                    debt_data = {
                        'debtor_id': friend,
                        'creditor_id': user_id,
                        'amount': split_amount,
                        'expense_id': expense_id,
                        'created_at': datetime.utcnow()
                    }
                    debt_operations.append(debt_data)
                
                if debt_operations:
                    await async_db.debts.insert_many(debt_operations, session=session)
                
                log_info(f"Async Transaction: Debts created", count=len(friends))
                
                # Step 5: Update group totals
                if group_id:
                    await async_db.groups.update_one(
                        {'_id': ObjectId(group_id)},
                        {
                            '$inc': {'total_expenses': amount},
                            '$set': {'updated_at': datetime.utcnow()}
                        },
                        session=session
                    )
                    log_info(f"Async Transaction: Group totals updated", group_id=group_id)
                
                # Commit transaction
                await session.commit_transaction()
                log_info(f"Async Transaction: Committed successfully", expense_id=str(expense_id))
                
                return str(expense_id)
                
            except Exception as e:
                log_error(f"Async Transaction: Failed and rolled back", error=str(e))
                await session.abort_transaction()
                raise
