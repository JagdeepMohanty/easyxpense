from .base_repository import BaseRepository
from bson import ObjectId
from typing import List, Dict, Any

class ExpenseRepository(BaseRepository):
    collection_name = 'expenses'
    
    @classmethod
    def find_by_user(cls, user_id: str, page: int = 1, limit: int = 10) -> List[Dict[str, Any]]:
        """Find expenses by user with pagination"""
        skip = (page - 1) * limit
        return cls.find_many(
            {'user_id': user_id},
            skip=skip,
            limit=limit,
            sort=[('date', -1)]
        )
    
    @classmethod
    async def async_find_by_user(cls, user_id: str, page: int = 1, limit: int = 10) -> List[Dict[str, Any]]:
        """Async find expenses by user with pagination"""
        skip = (page - 1) * limit
        return await cls.async_find_many(
            {'user_id': user_id},
            skip=skip,
            limit=limit,
            sort=[('date', -1)]
        )
    
    @classmethod
    def count_by_user(cls, user_id: str) -> int:
        """Count expenses by user"""
        return cls.count({'user_id': user_id})
    
    @classmethod
    async def async_count_by_user(cls, user_id: str) -> int:
        """Async count expenses by user"""
        return await cls.async_count({'user_id': user_id})
    
    @classmethod
    def create(cls, expense_data: Dict[str, Any]):
        """Create new expense"""
        return cls.insert_one(expense_data)
    
    @classmethod
    async def async_create(cls, expense_data: Dict[str, Any]):
        """Async create new expense"""
        return await cls.async_insert_one(expense_data)
    
    @classmethod
    def delete_by_id(cls, expense_id: str, user_id: str):
        """Delete expense by ID and user"""
        return cls.delete_one({
            '_id': ObjectId(expense_id),
            'user_id': user_id
        })
    
    @classmethod
    async def async_delete_by_id(cls, expense_id: str, user_id: str):
        """Async delete expense by ID and user"""
        return await cls.async_delete_one({
            '_id': ObjectId(expense_id),
            'user_id': user_id
        })
    
    @classmethod
    def find_by_user_and_date_range(cls, user_id: str, start_date, end_date) -> List[Dict[str, Any]]:
        """Find expenses by user and date range"""
        return cls.find_many({
            'user_id': user_id,
            'date': {'$gte': start_date, '$lte': end_date}
        }, limit=None)
    
    @classmethod
    async def async_find_by_user_and_date_range(cls, user_id: str, start_date, end_date) -> List[Dict[str, Any]]:
        """Async find expenses by user and date range"""
        return await cls.async_find_many({
            'user_id': user_id,
            'date': {'$gte': start_date, '$lte': end_date}
        }, limit=None)
