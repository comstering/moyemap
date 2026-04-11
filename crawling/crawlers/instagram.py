"""
Instagram 해시태그 기반 크롤러.

instaloader를 사용하여 서울 파티/혼술바 관련 해시태그 게시물을 수집합니다.

사용법:
  1. Instagram 계정 로그인 (선택, 로그인하면 더 많은 데이터 접근 가능)
     $ instaloader --login YOUR_USERNAME
  2. 이후 세션이 저장되어 자동 로그인

주의:
  - Instagram은 비로그인 상태에서 해시태그 검색을 제한합니다
  - 너무 빠른 요청은 차단될 수 있으므로 적절한 딜레이를 넣습니다
  - 상업적 대량 크롤링은 Instagram ToS 위반 가능성이 있습니다
"""

import re
import time
from datetime import datetime, timedelta
from typing import Optional

import instaloader

from crawling.models import Party, Location


# 카테고리별 검색 해시태그
HASHTAGS = {
    "bar": [
        "서울혼술바", "혼술바", "혼술", "서울바",
        "와인바서울", "칵테일바서울", "이태원바",
        "홍대혼술", "강남바", "성수바",
    ],
    "social": [
        "소셜파티", "서울파티", "서울소셜",
        "파티서울", "소셜모임", "서울번개",
        "홍대파티", "이태원파티", "강남파티",
    ],
    "guesthouse": [
        "게스트하우스파티", "게하파티", "서울게스트하우스",
        "홍대게스트하우스", "이태원게하",
    ],
    "networking": [
        "네트워킹파티", "서울네트워킹", "네트워킹모임",
        "직장인모임", "스타트업네트워킹", "서울밋업",
    ],
}

# 지역 키워드 → region 매핑
REGION_KEYWORDS = {
    "홍대": "홍대/연남", "연남": "홍대/연남", "합정": "홍대/연남", "상수": "홍대/연남",
    "강남": "강남", "역삼": "강남", "선릉": "강남", "압구정": "강남", "청담": "강남",
    "이태원": "이태원", "한남": "이태원", "경리단": "이태원", "녹사평": "이태원",
    "성수": "성수", "뚝섬": "성수", "서울숲": "성수",
    "잠실": "잠실/송파", "송파": "잠실/송파",
    "신촌": "신촌/마포", "마포": "신촌/마포", "망원": "신촌/마포",
}


def detect_region(text: str) -> str:
    for keyword, region in REGION_KEYWORDS.items():
        if keyword in text:
            return region
    return "서울"


def extract_price(text: str) -> Optional[int]:
    """게시물 텍스트에서 참가비/가격을 추출"""
    patterns = [
        r"(\d[\d,]*)\s*원",
        r"참가비\s*[:\-]?\s*(\d[\d,]*)",
        r"가격\s*[:\-]?\s*(\d[\d,]*)",
        r"(\d+)\s*만\s*원",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            val = match.group(1).replace(",", "")
            if "만" in text[match.start():match.end() + 2]:
                return int(val) * 10000
            num = int(val)
            if num < 1000:
                return num * 10000
            return num
    return None


def extract_date(text: str, post_date: datetime) -> str:
    """게시물에서 날짜 추출, 없으면 게시물 날짜 사용"""
    patterns = [
        r"(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})",
        r"(\d{1,2})[.\-/](\d{1,2})\s*[(\[]?[월화수목금토일]",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            groups = match.groups()
            if len(groups) == 3:
                return f"{groups[0]}-{int(groups[1]):02d}-{int(groups[2]):02d}"
            elif len(groups) == 2:
                year = post_date.year
                return f"{year}-{int(groups[0]):02d}-{int(groups[1]):02d}"
    return post_date.strftime("%Y-%m-%d")


def extract_time(text: str) -> str:
    patterns = [
        r"(\d{1,2})\s*:\s*(\d{2})\s*(pm|PM|오후)",
        r"(\d{1,2})\s*:\s*(\d{2})",
        r"(오후|저녁|밤)\s*(\d{1,2})\s*시",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            groups = match.groups()
            if groups[-1] in ("pm", "PM", "오후"):
                hour = int(groups[0])
                minute = groups[1] if len(groups) > 2 else "00"
                if hour < 12:
                    hour += 12
                return f"{hour}:{minute}"
            elif groups[0] in ("오후", "저녁", "밤"):
                hour = int(groups[1])
                if hour < 12:
                    hour += 12
                return f"{hour}:00"
            else:
                return f"{int(groups[0]):02d}:{groups[1]}"
    return "19:00"


def crawl_instagram(
    username: Optional[str] = None,
    max_posts_per_tag: int = 20,
    days_back: int = 30,
) -> list[Party]:
    """
    Instagram 해시태그 크롤링.

    Args:
        username: Instagram 로그인 계정 (None이면 비로그인)
        max_posts_per_tag: 해시태그당 최대 수집 게시물 수
        days_back: 최근 N일 이내 게시물만 수집
    """
    loader = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
    )

    if username:
        try:
            loader.load_session_from_file(username)
            print(f"[Instagram] 세션 로드: {username}")
        except FileNotFoundError:
            print(f"[Instagram] 세션 파일 없음. 먼저 'instaloader --login {username}'을 실행하세요.")
            return []

    cutoff = datetime.now() - timedelta(days=days_back)
    parties: list[Party] = []
    seen_ids: set[str] = set()

    for category, tags in HASHTAGS.items():
        for tag in tags:
            print(f"[Instagram] #{tag} 검색 중...")
            try:
                hashtag = instaloader.Hashtag.from_name(loader.context, tag)
            except Exception as e:
                print(f"  -> 해시태그 로드 실패: {e}")
                continue

            count = 0
            try:
                for post in hashtag.get_posts():
                    if post.date_utc < cutoff:
                        break
                    if count >= max_posts_per_tag:
                        break

                    post_id = str(post.mediaid)
                    if post_id in seen_ids:
                        continue
                    seen_ids.add(post_id)

                    caption = post.caption or ""
                    if not any(kw in caption for kw in ["서울", "홍대", "강남", "이태원", "성수", "마포", "신촌", "잠실"]):
                        continue

                    region = detect_region(caption)
                    price = extract_price(caption) or 30000
                    date = extract_date(caption, post.date_utc)
                    event_time = extract_time(caption)

                    title_match = re.search(r"[^\n]{5,40}", caption)
                    title = title_match.group(0).strip() if title_match else caption[:40]

                    party = Party(
                        id=f"ig-{post.shortcode}",
                        title=title,
                        category=category,
                        location=Location(
                            name=post.location.name if post.location else region,
                            lat=post.location.lat if post.location and post.location.lat else 37.5665,
                            lng=post.location.lng if post.location and post.location.lng else 126.9780,
                            region=region,
                        ),
                        date=date,
                        time=event_time,
                        price=price,
                        ageRange="20-30대",
                        imageUrl=str(post.url),
                        images=[str(node.display_url) for node in post.get_sidecar_nodes()] if post.typename == "GraphSidecar" else [],
                        description=caption[:500],
                        amenities=[],
                        sourceUrl=f"https://www.instagram.com/p/{post.shortcode}/",
                        tags=[t.strip("#") for t in re.findall(r"#\w+", caption)[:10]],
                        source="instagram",
                    )
                    parties.append(party)
                    count += 1

            except Exception as e:
                print(f"  -> 크롤링 에러: {e}")

            time.sleep(2)

    print(f"[Instagram] 총 {len(parties)}개 수집 완료")
    return parties
