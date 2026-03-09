from flask import current_app
from datetime import datetime
from bson import ObjectId

def get_user_friends(user_id, page=1, limit=10, search=''):
    query = {'user_id': user_id}
    if search:
        query['name'] = {'$regex': search, '$options': 'i'}
    
    total = current_app.db.friends.count_documents(query)
    friends = list(current_app.db.friends.find(query)
                  .skip((page - 1) * limit)
                  .limit(limit)
                  .sort('name', 1))
    
    for friend in friends:
        friend['_id'] = str(friend['_id'])
    
    return {
        'data': friends,
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit
    }

def add_friend(user_id, name, phone=None):
    existing = current_app.db.friends.find_one({'user_id': user_id, 'name': name})
    if existing:
        raise ValueError('Friend already exists')
    
    friend_data = {
        'user_id': user_id,
        'name': name,
        'phone': phone,
        'created_at': datetime.utcnow()
    }
    
    result = current_app.db.friends.insert_one(friend_data)
    return str(result.inserted_id)

def update_friend(user_id, friend_id, name, phone=None):
    result = current_app.db.friends.update_one(
        {'_id': ObjectId(friend_id), 'user_id': user_id},
        {'$set': {'name': name, 'phone': phone, 'updated_at': datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise ValueError('Friend not found')
    
    return True

def delete_friend(user_id, friend_id):
    result = current_app.db.friends.delete_one({
        '_id': ObjectId(friend_id),
        'user_id': user_id
    })
    
    if result.deleted_count == 0:
        raise ValueError('Friend not found')
    
    return True
