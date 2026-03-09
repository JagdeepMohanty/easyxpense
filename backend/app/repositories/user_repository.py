from .base_repository import BaseRepository
from typing import Dict, Any, Optional

class UserRepository(BaseRepository):
    collection_name = 'users'
    
    @classmethod
    def find_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        """Find user by email"""
        return cls.find_one({'email': email})
    
    @classmethod
    def find_by_phone(cls, phone: str) -> Optional[Dict[str, Any]]:
        """Find user by phone"""
        return cls.find_one({'phone': phone})
    
    @classmethod
    def find_by_email_or_phone(cls, email: str = None, phone: str = None) -> Optional[Dict[str, Any]]:
        """Find user by email or phone"""
        query = {}
        if email:
            query['email'] = email
        if phone:
            query['phone'] = phone
        return cls.find_one(query) if query else None
    
    @classmethod
    def create(cls, user_data: Dict[str, Any]):
        """Create new user"""
        return cls.insert_one(user_data)
    
    @classmethod
    async def async_create(cls, user_data: Dict[str, Any]):
        """Async create new user"""
        return await cls.async_insert_one(user_data)
