from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

class ExpenseCreateSchema(BaseModel):
    amount: float = Field(..., gt=0, description='Amount must be positive')
    description: str = Field(..., min_length=1, max_length=500)
    category: str = Field(..., min_length=1, max_length=100)
    date: Optional[str] = None
    friends: List[str] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            'example': {
                'amount': 100.0,
                'description': 'Lunch',
                'category': 'Food',
                'date': '2024-01-15T12:00:00Z',
                'friends': ['Alice', 'Bob']
            }
        }
