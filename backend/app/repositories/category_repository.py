from app.repositories.base_repository import BaseRepository
from bson import ObjectId

class CategoryRepository(BaseRepository):
    collection_name = 'categories'
    
    @classmethod
    def find_by_name(cls, name):
        """Find category by name"""
        return cls.get_collection().find_one({'name': name.lower().strip()})
    
    @classmethod
    async def async_find_by_name(cls, name):
        """Async find category by name"""
        return await cls.get_async_collection().find_one({'name': name.lower().strip()})
    
    @classmethod
    def find_all_system_categories(cls):
        """Get all system categories (user_id is None)"""
        return list(cls.get_collection().find({'user_id': None}))
    
    @classmethod
    async def async_find_all_system_categories(cls):
        """Async get all system categories"""
        cursor = cls.get_async_collection().find({'user_id': None})
        return await cursor.to_list(length=None)
    
    @classmethod
    def find_or_create(cls, name, user_id=None):
        """Find existing category or create new one"""
        category = cls.find_by_name(name)
        if category:
            return category
        
        from app.models.category_model import Category
        category_data = Category.create(name, user_id)
        result = cls.create(category_data)
        category_data['_id'] = result.inserted_id
        return category_data
    
    @classmethod
    async def async_find_or_create(cls, name, user_id=None):
        """Async find existing category or create new one"""
        category = await cls.async_find_by_name(name)
        if category:
            return category
        
        from app.models.category_model import Category
        category_data = Category.create(name, user_id)
        result = await cls.async_create(category_data)
        category_data['_id'] = result.inserted_id
        return category_data
