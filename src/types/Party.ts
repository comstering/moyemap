export interface Party {
  id: string;
  title: string;
  category: 'social' | 'bar' | 'guesthouse' | 'networking';
  location: {
    name: string;
    lat: number;
    lng: number;
    region: string;
  };
  date: string;
  time: string;
  price: number;
  ageRange: string;
  genderRatio?: string;
  imageUrl: string;
  images: string[];
  description: string;
  amenities: string[];
  sourceUrl: string;
  tags: string[];
}

export type CategoryFilter = 'all' | Party['category'];
export type DateFilter = 'today' | 'tomorrow' | 'weekend' | 'all';
export type PriceFilter = 'all' | 'under30k' | '30k-50k' | 'over50k';
