import { notFound } from 'next/navigation';
import { MOCK_PARTIES } from '@/data/mockParties';
import PartyDetailContent from './PartyDetailContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return MOCK_PARTIES.map((party) => ({ id: party.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const party = MOCK_PARTIES.find((p) => p.id === id);
  if (!party) return { title: '모여맵 - 모임을 찾을 수 없습니다' };
  return {
    title: `${party.title} - 모여맵 MoyeMap`,
    description: party.description,
  };
}

export default async function PartyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const party = MOCK_PARTIES.find((p) => p.id === id);
  if (!party) notFound();

  return <PartyDetailContent party={party} />;
}
