from fastapi import FastAPI
from database import engine, Base, DATABASE_PATH
from auth import fastapi_users, auth_backend
from schemas import UserCreate, UserRead
import models

app = FastAPI(title="Crypto Portfolio Tracker API", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized successfully!")
    print(f"Database location: {DATABASE_PATH}")

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

@app.get("/")
def homepage():
    return {"message": "API running"}