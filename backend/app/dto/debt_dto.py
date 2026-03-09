from pydantic import BaseModel, Field

class SettlementCreateDTO(BaseModel):
    fromUser: str = Field(..., min_length=1)
    toUser: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
