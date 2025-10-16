from fastapi import APIRouter
from services import CoinGeckoService, redis_client
import time

test_router = APIRouter(tags=["testing"], prefix="/test")

@test_router.get("/rate-limit", summary="Test API rate limiting behavior")
async def test_rate_limit():
    """
    Test how the application handles rapid API calls to CoinGecko.
    - Makes 10 rapid requests alternating between Bitcoin and Ethereum
    - Shows caching and rate limiting in action
    - Useful for testing throttling configuration
    """
    start_time = time.time()
    results = []
    
    for i in range(10):
        coin = "bitcoin" if i % 2 == 0 else "ethereum"
        price = await CoinGeckoService.get_current_price(coin, "php")
        results.append({
            "request_number": i + 1,
            "coin": coin,
            "price": f"₱{price:,.2f}" if price else "Unavailable",
            "status": "success" if price else "rate_limited",
            "timestamp": time.time() - start_time
        })
    
    return {
        "test_type": "rate_limit_simulation",
        "total_requests": len(results),
        "successful_requests": len([r for r in results if r["status"] == "success"]),
        "failed_requests": len([r for r in results if r["status"] == "rate_limited"]),
        "total_duration_seconds": round(time.time() - start_time, 2),
        "requests": results
    }

@test_router.get("/force-rate-limit", summary="Force cache clearance and test rate limits")
async def test_force_rate_limit():
    """
    Forcefully clear cache and test rate limiting under heavy load.
    - Clears Bitcoin and Ethereum from cache
    - Makes 10 rapid fresh API calls
    - Demonstrates throttling and cache recovery
    """
    # clear cache for specific coins with currency
    cleared_coins = ["bitcoin", "ethereum"]
    for coin in cleared_coins:
        redis_client.delete(f"crypto_portfolio:price:{coin}:php")
    
    start_time = time.time()
    results = []
    
    for i in range(10):
        coin = "bitcoin" if i % 2 == 0 else "ethereum"
        price = await CoinGeckoService.get_current_price(coin, "php")
        
        results.append({
            "request_number": i + 1,
            "coin": coin,
            "price": f"₱{price:,.2f}" if price else "Unavailable",
            "status": "success" if price else "rate_limited", 
            "cache_status": "fresh_fetch" if i < 2 else "cached_or_limited",
            "timestamp": time.time() - start_time
        })
    
    return {
        "test_type": "forced_rate_limit",
        "cleared_cache": cleared_coins,
        "total_requests": len(results),
        "successful_requests": len([r for r in results if r["status"] == "success"]),
        "failed_requests": len([r for r in results if r["status"] == "rate_limited"]),
        "total_duration_seconds": round(time.time() - start_time, 2),
        "requests": results
    }

@test_router.get("/throttling", summary="Test throttling behavior specifically")
async def test_throttling():
    """
    Test the throttling mechanism with detailed timing information.
    - Shows wait times between requests
    - Demonstrates throttling in action
    - Useful for tuning throttle settings
    """
    start_time = time.time()
    results = []
    
    # test with coins that are unlikely to be cached
    test_coins = ["solana", "cardano", "polkadot", "chainlink", "litecoin"]
    
    for i, coin in enumerate(test_coins):
        request_start = time.time()
        price = await CoinGeckoService.get_current_price(coin, "php")
        request_end = time.time()
        
        results.append({
            "request_number": i + 1,
            "coin": coin,
            "price": f"₱{price:,.2f}" if price else "Unavailable",
            "status": "success" if price else "rate_limited",
            "request_duration_seconds": round(request_end - request_start, 2),
            "total_elapsed_seconds": round(request_end - start_time, 2)
        })
    
    return {
        "test_type": "throttling_behavior",
        "coins_tested": test_coins,
        "total_requests": len(results),
        "successful_requests": len([r for r in results if r["status"] == "success"]),
        "total_duration_seconds": round(time.time() - start_time, 2),
        "average_request_time": round(sum(r["request_duration_seconds"] for r in results) / len(results), 2),
        "requests": results
    }

@test_router.get("/cache-performance", summary="Test cache hit/miss performance")
async def test_cache_performance():
    """
    Test caching performance by making repeated requests.
    - First request should be slow (cache miss)
    - Subsequent requests should be fast (cache hit)
    - Demonstrates caching benefits
    """
    test_coin = "bitcoin"
    results = []
    
    # clear cache first with currency
    redis_client.delete(f"crypto_portfolio:price:{test_coin}:php")
    
    for i in range(5):
        start_time = time.time()
        price = await CoinGeckoService.get_current_price(test_coin, "php")
        end_time = time.time()
        
        results.append({
            "request_number": i + 1,
            "coin": test_coin,
            "price": f"₱{price:,.2f}" if price else "Unavailable",
            "response_time_seconds": round(end_time - start_time, 3),
            "cache_status": "miss" if i == 0 else "hit",
            "status": "success" if price else "rate_limited"
        })
    
    return {
        "test_type": "cache_performance",
        "coin_tested": test_coin,
        "cache_hits": len([r for r in results if r["cache_status"] == "hit"]),
        "cache_misses": len([r for r in results if r["cache_status"] == "miss"]),
        "average_response_time": round(sum(r["response_time_seconds"] for r in results) / len(results), 3),
        "performance_improvement": f"{((results[0]['response_time_seconds'] - results[1]['response_time_seconds']) / results[0]['response_time_seconds']) * 100:.1f}%",
        "requests": results
    }