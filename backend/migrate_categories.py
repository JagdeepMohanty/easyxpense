"""
Migration Script: Convert Category Strings to Category IDs
Migrates existing expenses from string categories to normalized category_id references

Usage: python migrate_categories.py
"""

from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI')

if not MONGO_URI:
    print("Error: MONGO_URI environment variable not set")
    exit(1)

# Default system categories
DEFAULT_CATEGORIES = [
    'food',
    'transport',
    'shopping',
    'bills',
    'entertainment',
    'health',
    'education',
    'travel',
    'utilities',
    'other'
]

def migrate_categories():
    """Migrate existing category strings to category_id references"""
    
    client = MongoClient(MONGO_URI)
    db = client['EasyXpense']
    
    print("Starting category migration...")
    print("=" * 60)
    
    # Step 1: Create default system categories
    print("\n1. Creating default system categories...")
    category_map = {}
    
    for category_name in DEFAULT_CATEGORIES:
        existing = db.categories.find_one({'name': category_name, 'user_id': None})
        
        if existing:
            category_map[category_name] = existing['_id']
            print(f"   ✓ {category_name} (already exists)")
        else:
            result = db.categories.insert_one({
                'name': category_name,
                'user_id': None,  # System category
                'created_at': datetime.utcnow()
            })
            category_map[category_name] = result.inserted_id
            print(f"   ✓ {category_name} (created)")
    
    # Step 2: Find all unique categories in expenses
    print("\n2. Finding unique categories in expenses...")
    unique_categories = db.expenses.distinct('category')
    print(f"   Found {len(unique_categories)} unique categories")
    
    # Step 3: Create categories for non-default ones
    print("\n3. Creating custom categories...")
    custom_count = 0
    
    for category_name in unique_categories:
        if not category_name:
            continue
        
        normalized_name = category_name.lower().strip()
        
        if normalized_name not in category_map:
            existing = db.categories.find_one({'name': normalized_name})
            
            if existing:
                category_map[normalized_name] = existing['_id']
            else:
                result = db.categories.insert_one({
                    'name': normalized_name,
                    'user_id': None,
                    'created_at': datetime.utcnow()
                })
                category_map[normalized_name] = result.inserted_id
                custom_count += 1
                print(f"   ✓ {normalized_name} (custom)")
    
    print(f"   Created {custom_count} custom categories")
    
    # Step 4: Update expenses with category_id
    print("\n4. Updating expenses with category_id...")
    
    expenses_to_update = db.expenses.find({'category': {'$exists': True}})
    total_expenses = db.expenses.count_documents({'category': {'$exists': True}})
    updated_count = 0
    skipped_count = 0
    
    print(f"   Processing {total_expenses} expenses...")
    
    for expense in expenses_to_update:
        category_name = expense.get('category')
        
        if not category_name:
            skipped_count += 1
            continue
        
        normalized_name = category_name.lower().strip()
        category_id = category_map.get(normalized_name)
        
        if category_id:
            db.expenses.update_one(
                {'_id': expense['_id']},
                {
                    '$set': {
                        'category_id': category_id,
                        'migrated_at': datetime.utcnow()
                    }
                    # Keep 'category' field for backward compatibility
                }
            )
            updated_count += 1
        else:
            skipped_count += 1
            print(f"   ⚠ Skipped expense {expense['_id']}: category '{category_name}' not found")
    
    print(f"   ✓ Updated {updated_count} expenses")
    print(f"   ⚠ Skipped {skipped_count} expenses")
    
    # Step 5: Verification
    print("\n5. Verification...")
    
    expenses_with_category_id = db.expenses.count_documents({'category_id': {'$exists': True}})
    total_categories = db.categories.count_documents({})
    
    print(f"   Total categories: {total_categories}")
    print(f"   Expenses with category_id: {expenses_with_category_id}")
    print(f"   Migration success rate: {(expenses_with_category_id / total_expenses * 100):.1f}%")
    
    # Step 6: Summary
    print("\n" + "=" * 60)
    print("✅ Migration completed successfully!")
    print("=" * 60)
    
    print("\nMigration Summary:")
    print(f"  - System categories created: {len(DEFAULT_CATEGORIES)}")
    print(f"  - Custom categories created: {custom_count}")
    print(f"  - Total categories: {total_categories}")
    print(f"  - Expenses updated: {updated_count}")
    print(f"  - Expenses skipped: {skipped_count}")
    
    print("\nCategory Breakdown:")
    for category in db.categories.find().sort('name', 1):
        expense_count = db.expenses.count_documents({'category_id': category['_id']})
        category_type = "SYSTEM" if category.get('user_id') is None else "CUSTOM"
        print(f"  - {category['name']}: {expense_count} expenses [{category_type}]")
    
    print("\n⚠ IMPORTANT: The 'category' field is kept for backward compatibility.")
    print("   You can safely remove it after verifying the migration.")
    
    client.close()

def rollback_migration():
    """Rollback migration by removing category_id fields"""
    
    client = MongoClient(MONGO_URI)
    db = client['EasyXpense']
    
    print("Rolling back category migration...")
    
    result = db.expenses.update_many(
        {'category_id': {'$exists': True}},
        {'$unset': {'category_id': '', 'migrated_at': ''}}
    )
    
    print(f"✓ Removed category_id from {result.modified_count} expenses")
    
    # Optionally delete categories collection
    response = input("Delete categories collection? (yes/no): ")
    if response.lower() == 'yes':
        db.categories.drop()
        print("✓ Categories collection deleted")
    
    client.close()
    print("✅ Rollback completed")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--rollback':
        rollback_migration()
    else:
        migrate_categories()
