"""
프립(Frip) 크롤러.

프립에서 소셜파티, 네트워킹, 모임 관련 이벤트를 수집합니다.
Playwright를 사용하여 동적 페이지를 렌더링합니다.

설치:
  $ pip install playwright
  $ playwright install chromium
"""

import re
import json
from typing import Optional
from playwright.sync_api import sync_playwright, Page

from crawling.models import Party, Location


SEARCH_QUERIES = [
    "소셜파티",
    "혼술",
    "네트워킹",
    "와인파티",
    "소셜모임",
    "바파티",
]

FRIP_BASE = "https://www.frip.co.kr"


def parse_price(text: str) -> int:
    match = re.search(r"([\d,]+)", text.replace(" ", ""))
    if match:
        return int(match.group(1).replace(",", ""))
    return 0


def detect_category(title: str, desc: str) -> str:
    text = f"{title} {desc}".lower()
    if any(kw in text for kw in ["혼술", "와인바", "칵테일", "바", "술"]):
        return "bar"
    if any(kw in text for kw in ["게스트하우스", "게하"]):
        return "guesthouse"
    if any(kw in text for kw in ["네트워킹", "밋업", "스타트업", "직장인"]):
        return "networking"
    return "social"


def detect_region(address: str) -> str:
    region_map = {
        "홍대": "홍대/연남", "연남": "홍대/연남", "합정": "홍대/연남", "상수": "홍대/연남",
        "강남": "강남", "역삼": "강남", "선릉": "강남", "압구정": "강남",
        "이태원": "이태원", "한남": "이태원", "경리단": "이태원",
        "성수": "성수", "뚝섬": "성수", "서울숲": "성수",
        "잠실": "잠실/송파", "송파": "잠실/송파",
        "신촌": "신촌/마포", "마포": "신촌/마포", "망원": "신촌/마포",
    }
    for keyword, region in region_map.items():
        if keyword in address:
            return region
    return "서울"


def crawl_frip_page(page: Page, query: str, max_items: int = 20) -> list[dict]:
    """프립 검색 결과 페이지에서 아이템 정보 수집"""
    items = []
    url = f"{FRIP_BASE}/search?query={query}"
    print(f"[Frip] 검색: {query}")

    try:
        page.goto(url, wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(2000)

        # 스크롤하여 더 많은 결과 로드
        for _ in range(3):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(1000)

        cards = page.query_selector_all('a[href*="/products/"]')

        for card in cards[:max_items]:
            try:
                href = card.get_attribute("href") or ""
                title_el = card.query_selector("h3, [class*='title'], [class*='name']")
                price_el = card.query_selector("[class*='price'], [class*='cost']")
                img_el = card.query_selector("img")

                title = title_el.inner_text().strip() if title_el else ""
                price_text = price_el.inner_text().strip() if price_el else "0"
                img_url = img_el.get_attribute("src") if img_el else ""

                if not title:
                    continue

                items.append({
                    "title": title,
                    "price": parse_price(price_text),
                    "imageUrl": img_url or "",
                    "sourceUrl": f"{FRIP_BASE}{href}" if href.startswith("/") else href,
                    "query": query,
                })
            except Exception:
                continue

    except Exception as e:
        print(f"  -> 페이지 로드 실패: {e}")

    return items


def crawl_frip_detail(page: Page, url: str) -> dict:
    """프립 상세 페이지에서 추가 정보 수집"""
    info = {"description": "", "address": "", "date": "", "time": "", "images": []}

    try:
        page.goto(url, wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1500)

        # 설명
        desc_el = page.query_selector("[class*='description'], [class*='content'], [class*='detail']")
        if desc_el:
            info["description"] = desc_el.inner_text()[:500].strip()

        # 주소
        addr_el = page.query_selector("[class*='location'], [class*='address'], [class*='place']")
        if addr_el:
            info["address"] = addr_el.inner_text().strip()

        # 일정
        date_el = page.query_selector("[class*='date'], [class*='schedule'], time")
        if date_el:
            date_text = date_el.inner_text().strip()
            date_match = re.search(r"(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})", date_text)
            if date_match:
                info["date"] = f"{date_match.group(1)}-{int(date_match.group(2)):02d}-{int(date_match.group(3)):02d}"
            time_match = re.search(r"(\d{1,2}):(\d{2})", date_text)
            if time_match:
                info["time"] = f"{int(time_match.group(1)):02d}:{time_match.group(2)}"

        # 이미지
        img_els = page.query_selector_all("[class*='gallery'] img, [class*='slider'] img, [class*='swiper'] img")
        info["images"] = [img.get_attribute("src") for img in img_els[:5] if img.get_attribute("src")]

    except Exception as e:
        print(f"  -> 상세 페이지 파싱 실패: {e}")

    return info


def crawl_frip(max_items_per_query: int = 10, fetch_details: bool = True) -> list[Party]:
    """
    프립 크롤링 메인 함수.

    Args:
        max_items_per_query: 검색어당 최대 수집 수
        fetch_details: 상세 페이지 방문 여부 (느리지만 정보 풍부)
    """
    parties: list[Party] = []
    seen_urls: set[str] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900},
            locale="ko-KR",
        )
        page = context.new_page()

        for query in SEARCH_QUERIES:
            items = crawl_frip_page(page, query, max_items_per_query)

            for item in items:
                if item["sourceUrl"] in seen_urls:
                    continue
                seen_urls.add(item["sourceUrl"])

                detail = {}
                if fetch_details:
                    detail = crawl_frip_detail(page, item["sourceUrl"])
                    page.wait_for_timeout(1000)

                address = detail.get("address", "")
                region = detect_region(address or item["title"])
                category = detect_category(item["title"], detail.get("description", ""))

                party = Party(
                    id=f"frip-{len(parties)+1}",
                    title=item["title"],
                    category=category,
                    location=Location(
                        name=address or region,
                        lat=37.5665,
                        lng=126.9780,
                        region=region,
                    ),
                    date=detail.get("date", ""),
                    time=detail.get("time", "19:00"),
                    price=item["price"],
                    ageRange="20-30대",
                    imageUrl=item["imageUrl"],
                    images=detail.get("images", []),
                    description=detail.get("description", ""),
                    amenities=[],
                    sourceUrl=item["sourceUrl"],
                    tags=[query],
                    source="frip",
                )
                parties.append(party)

        browser.close()

    print(f"[Frip] 총 {len(parties)}개 수집 완료")
    return parties
