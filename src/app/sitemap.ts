import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://moyemap.lomeone.com';
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:8080/graphql';

async function fetchVenueIds(): Promise<string[]> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { venues(input: { status: PUBLISHED }) { id } }`,
      }),
      next: { revalidate: 3600 },
    });
    const json = await res.json();
    return (json.data?.venues ?? []).map((v: { id: string }) => v.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const venueIds = await fetchVenueIds();

  const venueEntries: MetadataRoute.Sitemap = venueIds.map((id) => ({
    url: `${BASE_URL}/venue/${id}`,
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
    ...venueEntries,
  ];
}
