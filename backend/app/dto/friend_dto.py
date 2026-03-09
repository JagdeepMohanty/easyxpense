from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re

class FriendCreateDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r'^[6-9]\d{9}$', v):
            raise ValueError('Invalid phone format')
        return v

class FriendUpdateDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r'^[6-9]\d{9}$', v):
            raise ValueError('Invalid phone format')
        return v
