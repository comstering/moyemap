"""
네이버 플레이스 검색 크롤러.

네이버 지역 검색을 통해 혼술바, 파티룸 등 장소 정보를 수집합니다.
Playwright로 네이버 플레이스 검색 결과를 파싱합니다.
"""

import re
from playwright.sync_api import sync_playwright, Page

from crawling.models import Party, Location


SEARCH_QUERIES = [
    "서울 혼술바",
    "서울 소셜파티",
    "서울 파티룸",
    "서울 와인바 모임",
    "홍대 바 파티",
    "이태원 바",
    "강남 네트워킹 바",
    "성수 와인바",
]

NAVER_PLACE_SEARCH = "https://map.naver.com/p/search/"


def detect_category(name: str, category_text: str) -> str:
    text = f"{name} {category_text}".lower()
    if any(kw in text for kw in ["혼술", "와인바", "칵테일", "바", "펍", "이자카야", "주점"]):
        return "bar"
    if any(kw in text for kw in ["게스트하우스", "게하", "호스텔"]):
        return "guesthouse"
    if any(kw in text for kw in ["네트워킹", "코워킹", "밋업"]):
        return "networking"
    return "social"


def detect_region(address: str) -> str:
    region_map = {
        "홍대": "홍대/연남", "연남": "홍대/연남", "합정": "홍대/연남", "상수": "홍대/연남", "마포구 연남": "홍대/연남",
        "강남": "강남", "역삼": "강남", "선릉": "강남", "압구정": "강남", "서초": "강남",
        "이태원": "이태원", "한남": "이태원", "경리단": "이태원", "용산구 이태원": "이태원",
        "성수": "성수", "뚝섬": "성수", "서울숲": "성수", "성동구 성수": "성수",
        "잠실": "잠실/송파", "송파": "잠실/송파",
        "신촌": "신촌/마포", "마포": "신촌/마포", "망원": "신촌/마포",
    }
    for keyword, region in region_map.items():
        if keyword in address:
            return region
    return "서울"


def crawl_naver_place(max_items_per_query: int = 10) -> list[Party]:
    """
    네이버 플레이스 검색 크롤링.

    Args:
        max_items_per_query: 검색어당 최대 수집 수
    """
    parties: list[Party] = []
    seen_names: set[str] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1400, "height": 900},
            locale="ko-KR",
        )
        page = context.new_page()

        for query in SEARCH_QUERIES:
            print(f"[NaverPlace] 검색: {query}")
            try:
                page.goto(f"{NAVER_PLACE_SEARCH}{query}", wait_until="domcontentloaded", timeout=15000)
                page.wait_for_timeout(3000)

                # 검색 결과 iframe 접근
                search_iframe = page.frame("searchIframe")
                if not search_iframe:
                    print("  -> searchIframe 없음")
                    continue

                # 장소 리스트 아이템
                items = search_iframe.query_selector_all("li.UEzoS, li[class*='item']")

                for item in items[:max_items_per_query]:
                    try:
                        name_el = item.query_selector("span.TYaxT, [class*='name'], [class*='title'] span")
                        category_el = item.query_selector("span.KCMnt, [class*='category']")
                        addr_el = item.query_selector("[class*='addr'], [class*='address']")
                        img_el = item.query_selector("img")

                        name = name_el.inner_text().strip() if name_el else ""
                        if not name or name in seen_names:
                            continue
                        seen_names.add(name)

                        category_text = category_el.inner_text().strip() if category_el else ""
                        address = addr_el.inner_text().strip() if addr_el else ""
                        img_url = img_el.get_attribute("src") if img_el else ""

                        region = detect_region(f"{name} {address}")
                        category = detect_category(name, category_text)

                        party = Party(
                            id=f"naver-{len(parties)+1}",
                            title=name,
                            category=category,
                            location=Location(
                                name=address or name,
                                lat=37.5665,
                                lng=126.9780,
                                region=region,
                            ),
                            date="",  # 장소 정보이므로 특정 날짜 없음
                            time="19:00",
                            price=0,
                            ageRange="20-30대",
                            imageUrl=img_url or "",
                            images=[],
                            description=f"{category_text} · {address}",
                            amenities=[],
                            sourceUrl=f"https://map.naver.com/p/search/{name}",
                            tags=[query.replace("서울 ", "")],
                            source="naver_place",
                        )
                        parties.append(party)

                    except Exception:
                        continue

            except Exception as e:
                print(f"  -> 검색 실패: {e}")

            page.wait_for_timeout(2000)

        browser.close()

    print(f"[NaverPlace] 총 {len(parties)}개 수집 완료")
    return parties
