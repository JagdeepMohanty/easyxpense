"""
MongoDB Index Setup Script for EasyXpense Production

Run this script once after deployment to ensure all indexes are created.
Usage: python setup_indexes.py
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
    
    print("Setting up MongoDB indexes for EasyXpense...")
    
    # Users collection
    print("\n1. Users collection:")
    db.users.create_index([("email", ASCENDING)], unique=True, sparse=True)
    print("   ✓ email (unique, sparse)")
    db.users.create_index([("phone", ASCENDING)], unique=True, sparse=True)
    print("   ✓ phone (unique, sparse)")
    
    # Friends collection
    print("\n2. Friends collection:")
    db.friends.create_index([("user_id", ASCENDING), ("name", ASCENDING)])
    print("   ✓ user_id + name")
    
    # Expenses collection
    print("\n3. Expenses collection:")
    db.expenses.create_index([("user_id", ASCENDING), ("date", DESCENDING)])
    print("   ✓ user_id + date (descending)")
    db.expenses.create_index([("user_id", ASCENDING), ("category", ASCENDING)])
    print("   ✓ user_id + category")
    db.expenses.create_index([("date", DESCENDING)])
    print("   ✓ date (descending)")
    
    # Settlements collection
    print("\n4. Settlements collection:")
    db.settlements.create_index([("user_id", ASCENDING), ("date", DESCENDING)])
    print("   ✓ user_id + date (descending)")
    
    # Groups collection
    print("\n5. Groups collection:")
    db.groups.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    print("   ✓ user_id + created_at (descending)")
    db.groups.create_index([("group_code", ASCENDING)], unique=True)
    print("   ✓ group_code (unique)")
    
    # Group Transactions collection
    print("\n6. Group Transactions collection:")
    db.group_transactions.create_index([("group_id", ASCENDING), ("created_at", DESCENDING)])
    print("   ✓ group_id + created_at (descending)")
    db.group_transactions.create_index([("user_id", ASCENDING)])
    print("   ✓ user_id")
    db.group_transactions.create_index([("paid_by", ASCENDING)])
    print("   ✓ paid_by")
    
    # Refresh Tokens collection
    print("\n7. Refresh Tokens collection:")
    db.refresh_tokens.create_index([("user_id", ASCENDING)])
    print("   ✓ user_id")
    db.refresh_tokens.create_index([("token", ASCENDING)], unique=True)
    print("   ✓ token (unique)")
    db.refresh_tokens.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
    print("   ✓ expires_at (TTL index)")
    
    print("\n✅ All indexes created successfully!")
    print("\nIndex Summary:")
    for collection_name in ['users', 'friends', 'expenses', 'settlements', 'groups', 'group_transactions', 'refresh_tokens']:
        indexes = list(db[collection_name].list_indexes())
        print(f"\n{collection_name}: {len(indexes)} indexes")
        for idx in indexes:
            if idx['name'] != '_id_':
                print(f"  - {idx['name']}")
    
    client.close()
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    exit(1)
