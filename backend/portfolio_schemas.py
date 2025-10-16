from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HoldingCreate(BaseModel):
    coin: str
    coin_symbol: str
    quantity: float
    buy_price: float
    currency: str = "php"
    notes: Optional[str] = None

class HoldingResponse(BaseModel):
    id: int
    coin: str
    coin_symbol: str
    quantity: float
    buy_price: float
    currency: str
    current_price: float
    total_invested: float
    current_value: float
    profit_loss: float
    profit_loss_percentage: float
    notes: Optional[str] = None
    created_at: datetime

class PortfolioStats(BaseModel):
    total_invested: float
    total_current_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    coin_count: int