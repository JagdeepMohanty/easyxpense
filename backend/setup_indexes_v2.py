"""
MongoDB Index Setup Script for EasyXpense Production v2
Enhanced with compound indexes, category collection, and debts optimization

Run this script once after deployment to ensure all indexes are created.
Usage: python setup_indexes_v2.py
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI')

if not MONGO_URI:
    print("Error: MONGO_URI environment variable not set")
    exit(1)

try:
    client = MongoClient(MONGO_URI)
    db = client['EasyXpense']
    
    print("Setting up MongoDB indexes for EasyXpense v2...")
    print("=" * 60)
    
    # Users collection
    print("\n1. Users collection:")
    db.users.create_index([("email", ASCENDING)], unique=True, sparse=True)
    print("   ✓ email (unique, sparse)")
    db.users.create_index([("phone", ASCENDING)], unique=True, sparse=True)
    print("   ✓ phone (unique, sparse)")
    
    # Categories collection (NEW)
    print("\n2. Categories collection (NEW):")
    db.categories.create_index([("name", ASCENDING)], unique=True)
    print("   ✓ name (unique)")
    db.categories.create_index([("user_id", ASCENDING)])
    print("   ✓ user_id")
    
    # Friends collection
    print("\n3. Friends collection:")
    db.friends.create_index([("user_id", ASCENDING), ("name", ASCENDING)])
    print("   ✓ user_id + name")
    
    # Expenses collection (ENHANCED)
    print("\n4. Expenses collection (ENHANCED):")
    db.expenses.create_index([("user_id", ASCENDING), ("date", DESCENDING)])
    print("   ✓ user_id + date (descending)")
    
    # NEW: Compound index for category filtering
    db.expenses.create_index([("user_id", ASCENDING), ("category_id", ASCENDING)])
    print("   ✓ user_id + category_id (NEW)")
    
    # NEW: Compound index for group expenses
    db.expenses.create_index([("group_id", ASCENDING), ("created_at", DESCENDING)])
    print("   ✓ group_id + created_at (NEW)")
    
    # Legacy category support (backward compatibility)
    db.expenses.create_index([("user_id", ASCENDING), ("category", ASCENDING)])
    print("   ✓ user_id + category (legacy)")
    
    db.expenses.create_index([("date", DESCENDING)])
    print("   ✓ date (descending)")
    
    db.expenses.create_index([("category_id", ASCENDING)])
    print("   ✓ category_id (NEW)")
    
    # Settlements collection (ENHANCED)
    print("\n5. Settlements collection (ENHANCED):")
    
    # NEW: Compound index for user settlements by date
    db.settlements.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    print("   ✓ user_id + created_at (NEW)")
    
    # Keep legacy index for backward compatibility
    db.settlements.create_index([("user_id", ASCENDING), ("date", DESCENDING)])
    print("   ✓ user_id + date (legacy)")
    
    # Debts collection (NEW)
    print("\n6. Debts collection (NEW):")
    
    # NEW: Compound index for debt queries
    db.debts.create_index([("debtor_id", ASCENDING), ("creditor_id", ASCENDING)])
    print("   ✓ debtor_id + creditor_id (NEW)")
    
    db.debts.create_index([("creditor_id", ASCENDING)])
    print("   ✓ creditor_id")
    
    db.debts.create_index([("expense_id", ASCENDING)])
    print("   ✓ expense_id")
    
    db.debts.create_index([("created_at", DESCENDING)])
    print("   ✓ created_at")
    
    # Groups collection
    print("\n7. Groups collection:")
    db.groups.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    print("   ✓ user_id + created_at (descending)")
    db.groups.create_index([("group_code", ASCENDING)], unique=True)
    print("   ✓ group_code (unique)")
    
    # Group Transactions collection
    print("\n8. Group Transactions collection:")
    db.group_transactions.create_index([("group_id", ASCENDING), ("created_at", DESCENDING)])
    print("   ✓ group_id + created_at (descending)")
    db.group_transactions.create_index([("user_id", ASCENDING)])
    print("   ✓ user_id")
    db.group_transactions.create_index([("paid_by", ASCENDING)])
    print("   ✓ paid_by")
    
    # Refresh Tokens collection
    print("\n9. Refresh Tokens collection:")
    db.refresh_tokens.create_index([("user_id", ASCENDING)])
    print("   ✓ user_id")
    db.refresh_tokens.create_index([("token", ASCENDING)], unique=True)
    print("   ✓ token (unique)")
    db.refresh_tokens.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
    print("   ✓ expires_at (TTL index)")
    
    print("\n" + "=" * 60)
    print("✅ All indexes created successfully!")
    print("=" * 60)
    
    print("\nIndex Summary:")
    for collection_name in ['users', 'categories', 'friends', 'expenses', 'settlements', 'debts', 'groups', 'group_transactions', 'refresh_tokens']:
        indexes = list(db[collection_name].list_indexes())
        print(f"\n{collection_name}: {len(indexes)} indexes")
        for idx in indexes:
            if idx['name'] != '_id_':
                keys = ', '.join([f"{k}:{v}" for k, v in idx['key']])
                unique = " [UNIQUE]" if idx.get('unique') else ""
                print(f"  - {idx['name']}: {keys}{unique}")
    
    client.close()
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    exit(1)
