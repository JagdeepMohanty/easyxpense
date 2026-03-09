from flask import current_app
from bson import ObjectId
from typing import List, Dict, Any, Optional

class BaseRepository:
    """Base repository with common database operations"""
    
    collection_name = None
    
    @classmethod
    def get_collection(cls):
        """Get sync collection"""
        return current_app.db[cls.collection_name]
    
    @classmethod
    def get_async_collection(cls):
        """Get async collection"""
        return current_app.async_db[cls.collection_name]
    
    @classmethod
    def find_one(cls, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find single document"""
        return cls.get_collection().find_one(query)
    
    @classmethod
    async def async_find_one(cls, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Async find single document"""
        return await cls.get_async_collection().find_one(query)
    
    @classmethod
    def find_many(cls, query: Dict[str, Any], skip: int = 0, limit: int = 10, sort: List = None) -> List[Dict[str, Any]]:
        """Find multiple documents"""
        cursor = cls.get_collection().find(query)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        if sort:
            cursor = cursor.sort(sort)
        return list(cursor)
    
    @classmethod
    async def async_find_many(cls, query: Dict[str, Any], skip: int = 0, limit: int = 10, sort: List = None) -> List[Dict[str, Any]]:
        """Async find multiple documents"""
        cursor = cls.get_async_collection().find(query)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        if sort:
            cursor = cursor.sort(sort)
        return [doc async for doc in cursor]
    
    @classmethod
    def count(cls, query: Dict[str, Any]) -> int:
        """Count documents"""
        return cls.get_collection().count_documents(query)
    
    @classmethod
    async def async_count(cls, query: Dict[str, Any]) -> int:
        """Async count documents"""
        return await cls.get_async_collection().count_documents(query)
    
    @classmethod
    def insert_one(cls, document: Dict[str, Any]):
        """Insert single document"""
        return cls.get_collection().insert_one(document)
    
    @classmethod
    async def async_insert_one(cls, document: Dict[str, Any]):
        """Async insert single document"""
        return await cls.get_async_collection().insert_one(document)
    
    @classmethod
    def update_one(cls, query: Dict[str, Any], update: Dict[str, Any]):
        """Update single document"""
        return cls.get_collection().update_one(query, update)
    
    @classmethod
    async def async_update_one(cls, query: Dict[str, Any], update: Dict[str, Any]):
        """Async update single document"""
        return await cls.get_async_collection().update_one(query, update)
    
    @classmethod
    def delete_one(cls, query: Dict[str, Any]):
        """Delete single document"""
        return cls.get_collection().delete_one(query)
    
    @classmethod
    async def async_delete_one(cls, query: Dict[str, Any]):
        """Async delete single document"""
        return await cls.get_async_collection().delete_one(query)
