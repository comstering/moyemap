export interface Party {
  id: string;
  title: string;
  category: 'Guesthouse' | 'Socialing' | 'Club' | 'Workshop';
  location: {
    name: string;
    lat: number;
    lng: number;
    region: string;
  };
  time: string;
  date: string;
  price: number;
  ageRange: string;
  genderRatio?: string;
  imageUrl: string;
  description: string;
  sourceUrl: string;
  tags: string[];
}
