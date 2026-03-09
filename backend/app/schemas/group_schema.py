from pydantic import BaseModel, Field
from typing import List

class GroupCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    members: List[str] = Field(..., min_items=1)
    
    class Config:
        json_schema_extra = {
            'example': {
                'name': 'Trip to Goa',
                'members': ['Alice', 'Bob', 'Charlie']
            }
        }
