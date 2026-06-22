import { VenueCategory } from '@/types/venue';


export const CATEGORY_LABELS: Record<VenueCategory, string> = {
  SOCIAL_PARTY: '🎉 소셜파티',
  SOLO_PARTY: '🎊 솔로파티',
  GUESTHOUSE_PARTY: '🏠 게하파티',
  ROTATION_DATING: '💕 로데이션',
  NETWORKING: '🤝 네트워킹',
  HONSOOL_BAR: '🍺 혼술바',
  BAR: '🍸 바',
  WORKSHOP: '🔧 워크샵',
  ETC: '📌 기타',
};

export const CATEGORY_FILTER_OPTIONS: { value: VenueCategory; label: string }[] =
  (Object.entries(CATEGORY_LABELS) as [VenueCategory, string][]).map(([value, label]) => ({ value, label }));

export const CATEGORY_COLORS: Record<VenueCategory, string> = {
  SOCIAL_PARTY: '#FF6B6B',
  SOLO_PARTY: '#FF8C42',
  GUESTHOUSE_PARTY: '#A855F7',
  ROTATION_DATING: '#EC4899',
  NETWORKING: '#10B981',
  HONSOOL_BAR: '#F59E0B',
  BAR: '#F59E0B',
  WORKSHOP: '#3B82F6',
  ETC: '#6B7280',
};
