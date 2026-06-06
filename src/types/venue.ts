// 서버 GraphQL 스키마와 1:1 대응
export type VenueCategory =
  | 'SOCIAL_PARTY'
  | 'SOLO_PARTY'
  | 'GUESTHOUSE_PARTY'
  | 'ROTATION_DATING'
  | 'NETWORKING'
  | 'HONSOOL_BAR'
  | 'BAR'
  | 'WORKSHOP'
  | 'ETC';

export type VenueStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

export interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  region: string;
  city?: string | null;
  district?: string | null;
}

export interface Venue {
  id: string;
  title: string;
  category: VenueCategory;
  status: VenueStatus;
  location: Location;
  minPrice: number | null;
  currency: string;
  imageUrl: string;
  description: string;
  sourceUrl: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// VenueCard: 목록 표시에 필요한 필드만 (GET_VENUES 응답)
export type VenueCard = Pick<Venue, 'id' | 'title' | 'category' | 'minPrice' | 'currency' | 'imageUrl' | 'sourceUrl' | 'tags'> & {
  location: Pick<Location, 'name' | 'address' | 'latitude' | 'longitude' | 'region'>;
};

// VenueMarker: 지도 핀 표시용 (GET_VENUE_MARKERS 응답)
export interface VenueMarker {
  id: string;
  title: string;
  category: VenueCategory;
  minPrice: number | null;
  latitude: number;
  longitude: number;
  region: string;
}

// 필터 타입
export type CategoryFilter = 'all' | VenueCategory;
export type PriceFilter = 'all' | 'under30k' | '30k-50k' | 'over50k';

// 가격 필터 → minPrice/maxPrice 변환
export function priceFilterToRange(filter: PriceFilter): { minPrice?: number; maxPrice?: number } {
  switch (filter) {
    case 'under30k': return { maxPrice: 29999 };
    case '30k-50k': return { minPrice: 30000, maxPrice: 49999 };
    case 'over50k': return { minPrice: 50000 };
    default: return {};
  }
}
