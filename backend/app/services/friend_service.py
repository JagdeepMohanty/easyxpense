from datetime import datetime
from app.repositories.friend_repository import FriendRepository

def get_user_friends(user_id, page=1, limit=10, search=''):
    total = FriendRepository.count_by_user(user_id, search)
    friends = FriendRepository.find_by_user(user_id, page, limit, search)
    
    for friend in friends:
        friend['_id'] = str(friend['_id'])
    
    return {
        'data': friends,
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit
    }

async def async_get_user_friends(user_id, page=1, limit=10, search=''):
    """Async version for better performance"""
    total = await FriendRepository.async_count_by_user(user_id, search)
    friends = await FriendRepository.async_find_by_user(user_id, page, limit, search)
    
    for friend in friends:
        friend['_id'] = str(friend['_id'])
    
    return {
        'data': friends,
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit
    }

def add_friend(user_id, name, phone=None):
    existing = FriendRepository.find_by_name(user_id, name)
    if existing:
        raise ValueError('Friend already exists')
    
    friend_data = {
        'user_id': user_id,
        'name': name,
        'phone': phone,
        'created_at': datetime.utcnow()
    }
    
    result = FriendRepository.create(friend_data)
    return str(result.inserted_id)

async def async_add_friend(user_id, name, phone=None):
    """Async version for better performance"""
    existing = FriendRepository.find_by_name(user_id, name)
    if existing:
        raise ValueError('Friend already exists')
    
    friend_data = {
        'user_id': user_id,
        'name': name,
        'phone': phone,
        'created_at': datetime.utcnow()
    }
    
    result = await FriendRepository.async_create(friend_data)
    return str(result.inserted_id)

def update_friend(user_id, friend_id, name, phone=None):
    update_data = {'name': name, 'phone': phone, 'updated_at': datetime.utcnow()}
    result = FriendRepository.update_by_id(friend_id, user_id, update_data)
    
    if result.matched_count == 0:
        raise ValueError('Friend not found')
    
    return True

def delete_friend(user_id, friend_id):
    result = FriendRepository.delete_by_id(friend_id, user_id)
    
    if result.deleted_count == 0:
        raise ValueError('Friend not found')
    
    return True
