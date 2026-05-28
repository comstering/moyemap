export interface Party {
  id: string;
  title: string;
  category: 'social' | 'bar' | 'networking' | 'meeting';
  location: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    region: string;
  };
  price: number;
  imageUrl: string;
  sourceUrl: string;
  tags: string[];
}

export type CategoryFilter = 'all' | Party['category'];
export type PriceFilter = 'all' | 'under30k' | '30k-50k' | 'over50k';
