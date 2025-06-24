import requests
import random
import time
from products.models import Product

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (Windows NT 10.0; rv:114.0) Gecko/20100101 Firefox/114.0",
]

def parse_wildberries(query: str, limit=100, delay=1.0):
    """
    Парсит товары Wildberries по запросу. Ограничение — limit товаров.
    Добавляет задержку delay (в секундах) между запросами.
    """

    print(f"[WB PARSER] Запрос: {query} | Лимит: {limit} | Задержка: {delay}s")

    saved_count = 0
    page = 1
    per_page = 100  # максимум товаров с одной страницы

    while saved_count < limit:
        try:
            url = (
                f"https://search.wb.ru/exactmatch/ru/common/v4/search?"
                f"appType=1&couponsGeo=12,3,18&curr=rub&dest=-1029256,-102269,-2162198,-1257786"
                f"&emp=0&lang=ru&locale=ru&pricemarginCoeff=1.0&query={query}&sort=popular"
                f"&resultset=catalog&page={page}&limit={per_page}"
            )
            

            headers = {
                "User-Agent": random.choice(USER_AGENTS)
            }

            print(f"[WB PARSER] → Страница {page} | GET {url}")
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            data = response.json()
            items = data.get("data", {}).get("products", [])

            if not items:
                print("[WB PARSER] Больше товаров не найдено.")
                break

            for item in items:
                if saved_count >= limit:
                    break

                name = item.get("name", "")
                price = item.get("priceU", 0) / 100
                discount_price = item.get("salePriceU", price * 100) / 100
                rating = item.get("rating", 0.0)
                feedback_count = item.get("feedbacks", 0)

                obj, created = Product.objects.get_or_create(
                    name=name,
                    defaults={
                        "price": price,
                        "discount_price": discount_price,
                        "rating": rating,
                        "feedback_count": feedback_count
                    }
                )

                if not created:
                    # обновим, если что-то поменялось
                    obj.price = price
                    obj.discount_price = discount_price
                    obj.rating = rating
                    obj.feedback_count = feedback_count
                    obj.save()

                saved_count += 1

            page += 1
            time.sleep(delay)  # задержка между запросами

        except Exception as e:
            print(f"[WB PARSER] ⚠️ Ошибка на странице {page}: {e}")
            break

    print(f"[WB PARSER] ✅ Загружено товаров: {saved_count}")
    return saved_count
