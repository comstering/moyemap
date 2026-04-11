"""Party data model matching the frontend Party interface."""

from dataclasses import dataclass, field, asdict
from typing import Optional
import json


@dataclass
class Location:
    name: str
    lat: float
    lng: float
    region: str  # e.g. "홍대/연남", "강남", "이태원", "성수"


@dataclass
class Party:
    id: str
    title: str
    category: str  # "social" | "bar" | "guesthouse" | "networking"
    location: Location
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    price: int
    ageRange: str
    imageUrl: str
    description: str
    sourceUrl: str
    genderRatio: Optional[str] = None
    images: list[str] = field(default_factory=list)
    amenities: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    source: str = ""  # "instagram" | "frip" | "naver" etc.

    def to_dict(self) -> dict:
        return asdict(self)


def save_parties(parties: list[Party], filepath: str):
    data = [p.to_dict() for p in parties]
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[*] {len(parties)}개 데이터 저장: {filepath}")


def load_parties(filepath: str) -> list[dict]:
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)
