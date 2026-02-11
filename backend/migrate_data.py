"""
Data Migration Script - Add user_id to existing data

This script migrates existing data to the new user-scoped model by:
1. Creating a default user (if needed)
2. Adding user_id to all existing records

Usage:
    python migrate_data.py --default-user-email admin@easyxpense.com
"""

import os
import sys
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import bcrypt

load_dotenv()

def get_db():
    """Connect to MongoDB"""
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        print("ERROR: MONGO_URI not found in environment")
        sys.exit(1)
    
    client = MongoClient(mongo_uri)
    return client['EasyXpense']

def create_default_user(db, email, name="Default User"):
    """Create default user if doesn't exist"""
    users = db.users
    
    # Check if user exists
    existing = users.find_one({'email': email})
    if existing:
        print(f"✓ User already exists: {email}")
        return existing['_id']
    
    # Create user
    password_hash = bcrypt.hashpw('changeme123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    from datetime import datetime
    user_doc = {
        'name': name,
        'email': email,
        'phone': None,
        'password_hash': password_hash,
        'created_at': datetime.utcnow(),
        'last_login': None
    }
    
    result = users.insert_one(user_doc)
    print(f"✓ Created default user: {email} (password: changeme123)")
    print(f"  User ID: {result.inserted_id}")
    return result.inserted_id

def migrate_collection(db, collection_name, user_id):
    """Add user_id to all documents in collection"""
    collection = db[collection_name]
    
    # Count documents without user_id
    count = collection.count_documents({'user_id': {'$exists': False}})
    
    if count == 0:
        print(f"✓ {collection_name}: No migration needed (0 documents)")
        return
    
    # Update all documents
    result = collection.update_many(
        {'user_id': {'$exists': False}},
        {'$set': {'user_id': user_id}}
    )
    
    print(f"✓ {collection_name}: Migrated {result.modified_count} documents")

def create_indexes(db):
    """Create recommended indexes"""
    print("\nCreating indexes...")
    
    try:
        db.friends.create_index([('user_id', 1), ('name', 1)])
        print("✓ friends: user_id + name index")
    except Exception as e:
        print(f"  friends index: {e}")
    
    try:
        db.expenses.create_index([('user_id', 1), ('date', -1)])
        print("✓ expenses: user_id + date index")
    except Exception as e:
        print(f"  expenses index: {e}")
    
    try:
        db.settlements.create_index([('user_id', 1), ('date', -1)])
        print("✓ settlements: user_id + date index")
    except Exception as e:
        print(f"  settlements index: {e}")
    
    try:
        db.groups.create_index([('user_id', 1), ('created_at', -1)])
        print("✓ groups: user_id + created_at index")
    except Exception as e:
        print(f"  groups index: {e}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Migrate EasyXpense data to user-scoped model')
    parser.add_argument('--default-user-email', default='admin@easyxpense.com',
                       help='Email for default user (default: admin@easyxpense.com)')
    parser.add_argument('--default-user-name', default='Default User',
                       help='Name for default user (default: Default User)')
    parser.add_argument('--skip-indexes', action='store_true',
                       help='Skip creating indexes')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("EasyXpense Data Migration - User-Scoped Model")
    print("=" * 60)
    
    # Connect to database
    print("\nConnecting to MongoDB...")
    db = get_db()
    print("✓ Connected")
    
    # Create default user
    print(f"\nCreating/finding default user: {args.default_user_email}")
    user_id = create_default_user(db, args.default_user_email, args.default_user_name)
    
    # Migrate collections
    print("\nMigrating collections...")
    migrate_collection(db, 'friends', user_id)
    migrate_collection(db, 'expenses', user_id)
    migrate_collection(db, 'settlements', user_id)
    migrate_collection(db, 'groups', user_id)
    
    # Create indexes
    if not args.skip_indexes:
        create_indexes(db)
    
    print("\n" + "=" * 60)
    print("✅ Migration Complete!")
    print("=" * 60)
    print(f"\nDefault user credentials:")
    print(f"  Email: {args.default_user_email}")
    print(f"  Password: changeme123")
    print(f"\n⚠️  IMPORTANT: Change the password after first login!")
    print("=" * 60)

if __name__ == '__main__':
    main()
