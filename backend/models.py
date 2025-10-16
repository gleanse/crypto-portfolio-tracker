from sqlalchemy import Integer, String, Float, Boolean, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
from datetime import datetime


class User(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ =  "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    holdings: Mapped[list["Holding"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Holding(Base):
    __tablename__ = "holdings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id")) 
    coin: Mapped[str] = mapped_column(String(50))
    coin_symbol: Mapped[str] = mapped_column(String(10))
    icon_url: Mapped[str] = mapped_column(String(255), nullable=True)
    quantity: Mapped[float] = mapped_column(Float)
    buy_price: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10), default="php")
    notes: Mapped[str] = mapped_column(String(200), nullable=True) 
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    user: Mapped["User"] = relationship(back_populates="holdings")
