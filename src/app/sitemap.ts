import type { MetadataRoute } from 'next';
import { MOCK_PARTIES } from '@/data/mockParties';

const BASE_URL = 'https://moyemap.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const partyPages: MetadataRoute.Sitemap = MOCK_PARTIES.map((party) => ({
    url: `${BASE_URL}/party/${party.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...partyPages,
  ];
}
