from .base_repository import BaseRepository
from typing import List, Dict, Any

class SettlementRepository(BaseRepository):
    collection_name = 'settlements'
    
    @classmethod
    def find_by_user(cls, user_id: str) -> List[Dict[str, Any]]:
        """Find settlements by user"""
        return cls.find_many({'user_id': user_id}, limit=None)
    
    @classmethod
    async def async_find_by_user(cls, user_id: str) -> List[Dict[str, Any]]:
        """Async find settlements by user"""
        return await cls.async_find_many({'user_id': user_id}, limit=None)
    
    @classmethod
    def create(cls, settlement_data: Dict[str, Any]):
        """Create new settlement"""
        return cls.insert_one(settlement_data)
    
    @classmethod
    async def async_create(cls, settlement_data: Dict[str, Any]):
        """Async create new settlement"""
        return await cls.async_insert_one(settlement_data)
