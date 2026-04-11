"""
모여맵 크롤링 메인 스크립트.

사용법:
  # 전체 크롤링
  $ python -m crawling.main

  # 특정 소스만
  $ python -m crawling.main --source instagram
  $ python -m crawling.main --source frip
  $ python -m crawling.main --source naver
  $ python -m crawling.main --source somoim

  # Instagram 로그인 사용
  $ python -m crawling.main --source instagram --ig-user YOUR_USERNAME

설치:
  $ cd crawling
  $ pip install -r requirements.txt
  $ playwright install chromium
"""

import argparse
import os
from datetime import datetime

from crawling.models import Party, save_parties
from crawling.crawlers.instagram import crawl_instagram
from crawling.crawlers.frip import crawl_frip
from crawling.crawlers.naver_place import crawl_naver_place
from crawling.crawlers.somoim import crawl_somoim


DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def merge_and_deduplicate(all_parties: list[Party]) -> list[Party]:
    """중복 제거 (제목 기반)"""
    seen_titles: set[str] = set()
    unique: list[Party] = []
    for p in all_parties:
        key = p.title.strip().lower()
        if key not in seen_titles:
            seen_titles.add(key)
            unique.append(p)
    return unique


def main():
    parser = argparse.ArgumentParser(description="모여맵 파티 데이터 크롤러")
    parser.add_argument("--source", choices=["instagram", "frip", "naver", "somoim", "all"], default="all")
    parser.add_argument("--ig-user", help="Instagram 로그인 계정")
    parser.add_argument("--max-items", type=int, default=15, help="소스별 최대 수집 수")
    parser.add_argument("--output", help="출력 파일명 (기본: crawled_{timestamp}.json)")
    args = parser.parse_args()

    os.makedirs(DATA_DIR, exist_ok=True)

    all_parties: list[Party] = []

    if args.source in ("instagram", "all"):
        print("\n=== Instagram 크롤링 ===")
        try:
            ig_parties = crawl_instagram(
                username=args.ig_user,
                max_posts_per_tag=args.max_items,
            )
            all_parties.extend(ig_parties)
        except Exception as e:
            print(f"[Instagram] 크롤링 실패: {e}")

    if args.source in ("frip", "all"):
        print("\n=== 프립 크롤링 ===")
        try:
            frip_parties = crawl_frip(max_items_per_query=args.max_items)
            all_parties.extend(frip_parties)
        except Exception as e:
            print(f"[Frip] 크롤링 실패: {e}")

    if args.source in ("naver", "all"):
        print("\n=== 네이버 플레이스 크롤링 ===")
        try:
            naver_parties = crawl_naver_place(max_items_per_query=args.max_items)
            all_parties.extend(naver_parties)
        except Exception as e:
            print(f"[NaverPlace] 크롤링 실패: {e}")

    if args.source in ("somoim", "all"):
        print("\n=== 소모임 크롤링 ===")
        try:
            somoim_parties = crawl_somoim(max_items_per_query=args.max_items)
            all_parties.extend(somoim_parties)
        except Exception as e:
            print(f"[Somoim] 크롤링 실패: {e}")

    # 중복 제거
    unique_parties = merge_and_deduplicate(all_parties)

    # 저장
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = args.output or f"crawled_{timestamp}.json"
    filepath = os.path.join(DATA_DIR, filename)
    save_parties(unique_parties, filepath)

    # 소스별 통계
    print("\n=== 크롤링 결과 ===")
    sources = {}
    categories = {}
    for p in unique_parties:
        sources[p.source] = sources.get(p.source, 0) + 1
        categories[p.category] = categories.get(p.category, 0) + 1

    print(f"총 {len(unique_parties)}개 (중복 제거 후)")
    for src, cnt in sorted(sources.items()):
        print(f"  - {src}: {cnt}개")
    for cat, cnt in sorted(categories.items()):
        print(f"  - {cat}: {cnt}개")
    print(f"\n저장 위치: {filepath}")


if __name__ == "__main__":
    main()
