from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from contextlib import asynccontextmanager
from database import engine, Base, DATABASE_PATH, get_db
from auth import fastapi_users, auth_backend
from schemas import UserCreate, UserRead, UserUpdate  
from models import User, Holding
from portfolio_schemas import HoldingCreate, HoldingResponse, PortfolioStats
from services import CoinGeckoService
from services import CoinGeckoService
from test.test_endpoints import test_router
from decouple import config
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized successfully!")
    print(f"Database location: {DATABASE_PATH}")
    yield
    await engine.dispose()
    print("Database connection closed.")

app = FastAPI(
    title="Crypto Portfolio Tracker API",
    version="1.0.0",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = config("ALLOWED_ORIGINS", default="http://localhost:5173").split(",")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

class UserDashboardResponse(BaseModel):
    id: int
    email: str
    username: str | None

@app.get("/users/me/dashboard", response_model=UserDashboardResponse, tags=["users"])
async def get_current_user_for_dashboard(
    user: User = Depends(fastapi_users.current_user())
    ):

    return UserDashboardResponse(
        id=user.id,
        email=user.email,
        username=user.username
    )

# only include test endpoints in development
# testing security and perfomances purposes only
ENABLE_TEST_ENDPOINTS = config("ENABLE_TEST_ENDPOINTS", default=False, cast=bool)

if ENABLE_TEST_ENDPOINTS:
    app.include_router(test_router)
    print("Test endpoints ENABLED - for development only")
else:
    print("Test endpoints DISABLED - production mode")


# APP ENDPOINTS DEFAULT====================
@app.post("/portfolio/", response_model=HoldingResponse)
async def add_holding(
    holding_data: HoldingCreate,
    user: User = Depends(fastapi_users.current_user()),
    db: AsyncSession = Depends(get_db)
):
    # get current price from coingecko in the specified currency
    current_price = await CoinGeckoService.get_current_price(holding_data.coin, holding_data.currency)

    if current_price is None:
        raise HTTPException(
            status_code=503,
            detail="CoinGecko API is currently unavailable. Please try again later."
        )
    icon_url = await CoinGeckoService.get_coin_icon_url(holding_data.coin)
    holding = Holding(
        user_id=user.id,
        coin=holding_data.coin,
        coin_symbol=holding_data.coin_symbol,
        icon_url=icon_url,
        quantity=holding_data.quantity,
        buy_price=holding_data.buy_price,
        currency=holding_data.currency,
        notes=holding_data.notes
    )
    
    db.add(holding)
    await db.commit()
    await db.refresh(holding)
    
    # calculate profit/loss for response
    total_invested = holding.quantity * holding.buy_price
    current_value = holding.quantity * current_price
    profit_loss = current_value - total_invested
    profit_loss_percentage = (profit_loss / total_invested) * 100 if total_invested > 0 else 0
    
    return HoldingResponse(
        id=holding.id,
        coin=holding.coin,
        coin_symbol=holding.coin_symbol,
        icon_url=holding.icon_url,
        quantity=holding.quantity,
        buy_price=holding.buy_price,
        currency=holding.currency,
        current_price=current_price,
        total_invested=total_invested,
        current_value=current_value,
        profit_loss=profit_loss,
        profit_loss_percentage=profit_loss_percentage,
        notes=holding.notes,
        created_at=holding.created_at
    )

@app.get("/portfolio/", response_model=list[HoldingResponse])
async def get_my_portfolio(
    user: User = Depends(fastapi_users.current_user()),
    db: AsyncSession = Depends(get_db)
):
    # get users holdings
    result = await db.execute(select(Holding).where(Holding.user_id == user.id))
    holdings = result.scalars().all()
    
    if not holdings:
        return []
    
    # group holdings by currency to make efficient api calls
    currency_groups = {}
    for holding in holdings:
        if holding.currency not in currency_groups:
            currency_groups[holding.currency] = []
        currency_groups[holding.currency].append(holding.coin)
    
    # get current prices for each currency group
    all_prices = {}
    for currency, coins in currency_groups.items():
        prices = await CoinGeckoService.get_multiple_prices(coins, currency)
        all_prices.update(prices)
    
    portfolio = []
    for holding in holdings:
        current_price = all_prices.get(holding.coin, {}).get(holding.currency, 0)

        # if price is unavailable, use buy_price (no profit/loss)
        if current_price is None:
            current_price = holding.buy_price

        total_invested = holding.quantity * holding.buy_price
        current_value = holding.quantity * current_price
        profit_loss = current_value - total_invested
        profit_loss_percentage = (profit_loss / total_invested) * 100 if total_invested > 0 else 0
        
        portfolio.append(HoldingResponse(
            id=holding.id,
            coin=holding.coin,
            coin_symbol=holding.coin_symbol,
            icon_url=holding.icon_url,
            quantity=holding.quantity,
            buy_price=holding.buy_price,
            currency=holding.currency,
            current_price=current_price,
            total_invested=total_invested,
            current_value=current_value,
            profit_loss=profit_loss,
            profit_loss_percentage=profit_loss_percentage,
            notes=holding.notes,
            created_at=holding.created_at
        ))
    
    return portfolio

@app.get("/portfolio/stats", response_model=PortfolioStats)
async def get_portfolio_stats(
    user: User = Depends(fastapi_users.current_user()),
    db: AsyncSession = Depends(get_db)
):
    # get users holdings with current prices
    holdings = await get_my_portfolio(user, db)
    
    if not holdings:
        return PortfolioStats(
            total_invested=0,
            total_current_value=0,
            total_profit_loss=0,
            total_profit_loss_percentage=0,
            coin_count=0
        )
    
    total_invested = sum(h.total_invested for h in holdings)
    total_current_value = sum(h.current_value for h in holdings)
    total_profit_loss = total_current_value - total_invested
    total_profit_loss_percentage = (total_profit_loss / total_invested) * 100 if total_invested > 0 else 0
    
    return PortfolioStats(
        total_invested=total_invested,
        total_current_value=total_current_value,
        total_profit_loss=total_profit_loss,
        total_profit_loss_percentage=total_profit_loss_percentage,
        coin_count=len(holdings)
    )

@app.delete("/portfolio/{holding_id}")
async def delete_holding(
    holding_id: int,
    user: User = Depends(fastapi_users.current_user()),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Holding).where(Holding.id == holding_id, Holding.user_id == user.id)
    )
    holding = result.scalar_one_or_none()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    await db.delete(holding)
    await db.commit()
    
    return {"message": "Holding deleted successfully"}

@app.get("/")
async def homepage():
    return {"message": "API running"}