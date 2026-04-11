"""
소모임(somoim) 크롤러.

소모임 플랫폼에서 서울 지역 파티/모임 정보를 수집합니다.
"""

import re
from playwright.sync_api import sync_playwright

from crawling.models import Party, Location


SEARCH_QUERIES = [
    "파티",
    "혼술",
    "네트워킹",
    "소셜",
    "와인",
]

SOMOIM_BASE = "https://somoim.co.kr"


def detect_category(title: str, desc: str = "") -> str:
    text = f"{title} {desc}".lower()
    if any(kw in text for kw in ["혼술", "와인", "칵테일", "바", "술", "맥주"]):
        return "bar"
    if any(kw in text for kw in ["게스트하우스", "게하"]):
        return "guesthouse"
    if any(kw in text for kw in ["네트워킹", "밋업", "스타트업", "직장인", "커리어"]):
        return "networking"
    return "social"


def detect_region(text: str) -> str:
    region_map = {
        "홍대": "홍대/연남", "연남": "홍대/연남", "합정": "홍대/연남",
        "강남": "강남", "역삼": "강남", "선릉": "강남",
        "이태원": "이태원", "한남": "이태원",
        "성수": "성수", "서울숲": "성수",
    }
    for keyword, region in region_map.items():
        if keyword in text:
            return region
    return "서울"


def crawl_somoim(max_items_per_query: int = 10) -> list[Party]:
    parties: list[Party] = []
    seen: set[str] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 900},
            locale="ko-KR",
        )
        page = context.new_page()

        for query in SEARCH_QUERIES:
            print(f"[Somoim] 검색: {query}")
            try:
                page.goto(f"{SOMOIM_BASE}/search?keyword={query}&category=lightning", wait_until="networkidle", timeout=15000)
                page.wait_for_timeout(2000)

                cards = page.query_selector_all("[class*='card'], [class*='item'], a[href*='/lightning/'], a[href*='/meeting/']")

                for card in cards[:max_items_per_query]:
                    try:
                        title_el = card.query_selector("h3, h4, [class*='title'], [class*='name']")
                        price_el = card.query_selector("[class*='price'], [class*='fee']")
                        date_el = card.query_selector("[class*='date'], [class*='time'], time")
                        location_el = card.query_selector("[class*='location'], [class*='place']")
                        img_el = card.query_selector("img")

                        title = title_el.inner_text().strip() if title_el else ""
                        if not title or title in seen:
                            continue
                        seen.add(title)

                        href = card.get_attribute("href") or ""
                        price_text = price_el.inner_text() if price_el else "0"
                        price_match = re.search(r"([\d,]+)", price_text.replace(" ", ""))
                        price = int(price_match.group(1).replace(",", "")) if price_match else 0

                        date_text = date_el.inner_text().strip() if date_el else ""
                        date_match = re.search(r"(\d{1,2})[./](\d{1,2})", date_text)
                        date = f"2026-{int(date_match.group(1)):02d}-{int(date_match.group(2)):02d}" if date_match else ""

                        time_match = re.search(r"(\d{1,2}):(\d{2})", date_text)
                        time_str = f"{int(time_match.group(1)):02d}:{time_match.group(2)}" if time_match else "19:00"

                        location_text = location_el.inner_text().strip() if location_el else ""
                        img_url = img_el.get_attribute("src") if img_el else ""

                        region = detect_region(f"{title} {location_text}")
                        category = detect_category(title)

                        source_url = f"{SOMOIM_BASE}{href}" if href.startswith("/") else href or f"{SOMOIM_BASE}/search?keyword={query}"

                        party = Party(
                            id=f"somoim-{len(parties)+1}",
                            title=title,
                            category=category,
                            location=Location(
                                name=location_text or region,
                                lat=37.5665,
                                lng=126.9780,
                                region=region,
                            ),
                            date=date,
                            time=time_str,
                            price=price,
                            ageRange="20-30대",
                            imageUrl=img_url or "",
                            images=[],
                            description="",
                            amenities=[],
                            sourceUrl=source_url,
                            tags=[query, "소모임"],
                            source="somoim",
                        )
                        parties.append(party)

                    except Exception:
                        continue

            except Exception as e:
                print(f"  -> 검색 실패: {e}")

            page.wait_for_timeout(1500)

        browser.close()

    print(f"[Somoim] 총 {len(parties)}개 수집 완료")
    return parties
