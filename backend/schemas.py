from fastapi_users import schemas

class UserRead(schemas.BaseUser[int]):
    username: str | None = None

class UserCreate(schemas.BaseUserCreate):
    username: str | None = None

class UserUpdate(schemas.BaseUserUpdate):
    username: str | None = None