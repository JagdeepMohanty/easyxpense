from .base_repository import BaseRepository
from bson import ObjectId
from typing import List, Dict, Any

class FriendRepository(BaseRepository):
    collection_name = 'friends'
    
    @classmethod
    def find_by_user(cls, user_id: str, page: int = 1, limit: int = 10, search: str = '') -> List[Dict[str, Any]]:
        """Find friends by user with pagination and search"""
        query = {'user_id': user_id}
        if search:
            query['name'] = {'$regex': search, '$options': 'i'}
        
        skip = (page - 1) * limit
        return cls.find_many(query, skip=skip, limit=limit, sort=[('name', 1)])
    
    @classmethod
    async def async_find_by_user(cls, user_id: str, page: int = 1, limit: int = 10, search: str = '') -> List[Dict[str, Any]]:
        """Async find friends by user"""
        query = {'user_id': user_id}
        if search:
            query['name'] = {'$regex': search, '$options': 'i'}
        
        skip = (page - 1) * limit
        return await cls.async_find_many(query, skip=skip, limit=limit, sort=[('name', 1)])
    
    @classmethod
    def count_by_user(cls, user_id: str, search: str = '') -> int:
        """Count friends by user"""
        query = {'user_id': user_id}
        if search:
            query['name'] = {'$regex': search, '$options': 'i'}
        return cls.count(query)
    
    @classmethod
    async def async_count_by_user(cls, user_id: str, search: str = '') -> int:
        """Async count friends by user"""
        query = {'user_id': user_id}
        if search:
            query['name'] = {'$regex': search, '$options': 'i'}
        return await cls.async_count(query)
    
    @classmethod
    def find_by_name(cls, user_id: str, name: str):
        """Find friend by name"""
        return cls.find_one({'user_id': user_id, 'name': name})
    
    @classmethod
    def create(cls, friend_data: Dict[str, Any]):
        """Create new friend"""
        return cls.insert_one(friend_data)
    
    @classmethod
    async def async_create(cls, friend_data: Dict[str, Any]):
        """Async create new friend"""
        return await cls.async_insert_one(friend_data)
    
    @classmethod
    def update_by_id(cls, friend_id: str, user_id: str, update_data: Dict[str, Any]):
        """Update friend by ID"""
        return cls.update_one(
            {'_id': ObjectId(friend_id), 'user_id': user_id},
            {'$set': update_data}
        )
    
    @classmethod
    def delete_by_id(cls, friend_id: str, user_id: str):
        """Delete friend by ID"""
        return cls.delete_one({
            '_id': ObjectId(friend_id),
            'user_id': user_id
        })
