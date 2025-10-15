from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable

class User(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ =  "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)