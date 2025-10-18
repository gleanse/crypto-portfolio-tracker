import asyncio
import time
import httpx
import redis
from decouple import config

REDIS_URL = config('REDIS_URL')
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# ==========THROTTLING=======
class RequestThrottler:
    def __init__(self, requests_per_minute=25):
        self.requests_per_minute = requests_per_minute
        self.requests = []
        print(f"Throttling enabled: {requests_per_minute} requests/minute")
    
    async def wait_if_needed(self):
        now = time.time()
        # remove requests older than 1 minute
        self.requests = [t for t in self.requests if now - t < 60]
        
        if len(self.requests) >= self.requests_per_minute:
            # wait until the oldest request is 1 minute old
            wait_time = 60 - (now - self.requests[0])
            if wait_time > 0:
                print(f"Throttling: Waiting {wait_time:.1f}s ({len(self.requests)}/{self.requests_per_minute} requests this minute)")
                await asyncio.sleep(wait_time)
            # update time and clean again after waiting
            now = time.time()
            self.requests = [t for t in self.requests if now - t < 60]
        
        self.requests.append(now)

throttler = RequestThrottler(requests_per_minute=25)
# =====END THROTTLING=====

class CoinGeckoService:
    # NOTE: adjust if necessary based on realtime fast changing value of the coins but for me i think its pretty decent and generous and make performance better 
    CACHE_DURATION = 75  # 1 mins and 15 secs
    
    @staticmethod
    async def get_current_price(coin_id: str, currency: str = "php"):
        # wait here if users making requests too fast
        await throttler.wait_if_needed()
        # include currency in cache key to support multiple currencies
        cache_key = f"crypto_portfolio:price:{coin_id}:{currency}"
        cached_price = redis_client.get(cache_key)
        
        if cached_price:
            print(f"Using REDIS cached price for {coin_id} in {currency.upper()}: {cached_price}")
            return float(cached_price)
        
        try:
            print(f"Fetching FRESH price for {coin_id} in {currency.upper()} from CoinGecko...")
            # support multiple currencies by including the currency parameter
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies={currency}"
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                
                if response.status_code == 429:
                    print("CoinGecko rate limit exceeded")
                    return None
                
                if response.status_code == 200:
                    data = response.json()
                    if coin_id in data and currency in data[coin_id]:
                        price = data[coin_id][currency]
                        redis_client.setex(
                            cache_key, 
                            CoinGeckoService.CACHE_DURATION,
                            price
                        )
                        print(f"Got FRESH price for {coin_id} in {currency.upper()}: {price} (cached in Redis)")
                        return price
                
                print(f"CoinGecko API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"CoinGecko failed: {e}")
            return None
    
    @staticmethod
    async def get_multiple_prices(coin_ids: list, currency: str = "php"):
        prices = {}
        
        # try to get all from redis first with currency support
        for coin_id in coin_ids:
            cache_key = f"crypto_portfolio:price:{coin_id}:{currency}"
            cached_price = redis_client.get(cache_key)
            if cached_price:
                prices[coin_id] = {currency: float(cached_price)}
        
        # fetch missing coins from coingecko
        missing_coins = [c for c in coin_ids if c not in prices]
        if missing_coins:
            try:
                await throttler.wait_if_needed()
                
                ids = ",".join(missing_coins)
                # include currency parameter for batch requests
                url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies={currency}"
                async with httpx.AsyncClient() as client:
                    response = await client.get(url)
                    
                    if response.status_code == 429:
                        print("CoinGecko rate limit exceeded in batch request")
                        for coin_id in missing_coins:
                            prices[coin_id] = {currency: None}
                        return prices
                    
                    if response.status_code == 200:
                        fresh_data = response.json()
                        for coin_id in missing_coins:
                            if coin_id in fresh_data and currency in fresh_data[coin_id]:
                                price = fresh_data[coin_id][currency]
                                redis_client.setex(
                                    f"crypto_portfolio:price:{coin_id}:{currency}",
                                    CoinGeckoService.CACHE_DURATION,
                                    price
                                )
                                prices[coin_id] = {currency: price}
                            else:
                                prices[coin_id] = {currency: None}
            except Exception as e:
                print(f"Batch fetch failed: {e}")
                for coin_id in missing_coins:
                    prices[coin_id] = {currency: None}
        
        return prices

    @staticmethod
    async def get_coin_icon_url(coin_id: str):
        print(f"DEBUG: Fetching icon for coin_id: '{coin_id}'")
        
        cache_key = f"crypto_portfolio:icon:{coin_id}"
        cached_icon = redis_client.get(cache_key)
        
        if cached_icon:
            print(f"Using REDIS cached icon for {coin_id}: {cached_icon}")
            return cached_icon
        
        try:
            await throttler.wait_if_needed()
            
            url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
            print(f"DEBUG: Making request to: {url}")
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                
                print(f"DEBUG: Response status: {response.status_code}")
                
                if response.status_code == 429:
                    print("CoinGecko rate limit exceeded for icon")
                    return None
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"DEBUG: Found image data: {data.get('image', {})}")

                    image_data = data.get('image', {})
                    icon_url = image_data.get('large')
                    
                    if icon_url:
                        print(f"Found icon URL: {icon_url}")
                        redis_client.setex(
                            cache_key,
                            CoinGeckoService.CACHE_DURATION * 2,
                            icon_url
                        )
                        print(f"Cached icon for {coin_id}: {icon_url}")
                        return icon_url
                    else:
                        print(f"No icon URL found in response")
                        return None
                else:
                    print(f"CoinGecko API error for icon: {response.status_code}")
                    print(f"Response text: {response.text}")
                    return None
                    
        except Exception as e:
            print(f"CoinGecko icon fetch failed: {e}")
            return None

    @staticmethod
    async def get_multiple_icons(coin_ids: list):
        icons = {}
        
        # try to get all from redis first
        for coin_id in coin_ids:
            cache_key = f"crypto_portfolio:icon:{coin_id}"
            cached_icon = redis_client.get(cache_key)
            if cached_icon:
                icons[coin_id] = cached_icon
        
        # fetch missing icons from coingecko
        missing_coins = [c for c in coin_ids if c not in icons]
        if missing_coins:
            try:
                await throttler.wait_if_needed()
                
                for coin_id in missing_coins:
                    icon_url = await CoinGeckoService.get_coin_icon_url(coin_id)
                    icons[coin_id] = icon_url
                    
            except Exception as e:
                print(f"Batch icon fetch failed: {e}")
                for coin_id in missing_coins:
                    if coin_id not in icons:
                        icons[coin_id] = None
        
        return icons