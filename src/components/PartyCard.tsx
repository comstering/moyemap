'use client';

import { MapPin, ExternalLink } from 'lucide-react';
import { VenueCard, VenueCategory } from '@/types/venue';
import Image from 'next/image';

const CATEGORY_COLORS: Record<VenueCategory, string> = {
  SOCIAL_PARTY:     'bg-primary',
  SOLO_PARTY:       'bg-orange-500',
  GUESTHOUSE_PARTY: 'bg-purple-500',
  ROTATION_DATING:  'bg-pink-500',
  NETWORKING:       'bg-emerald-500',
  HONSOOL_BAR:      'bg-amber-500',
  BAR:              'bg-amber-500',
  WORKSHOP:         'bg-blue-500',
  ETC:              'bg-gray-500',
};

const CATEGORY_LABELS: Record<VenueCategory, string> = {
  SOCIAL_PARTY:     '🎉 소셜파티',
  SOLO_PARTY:       '🎊 혼파티',
  GUESTHOUSE_PARTY: '🏠 게하파티',
  ROTATION_DATING:  '💕 로데이션',
  NETWORKING:       '🤝 네트워킹',
  HONSOOL_BAR:      '🍺 혼술바',
  BAR:              '🍸 바',
  WORKSHOP:         '🔧 워크샵',
  ETC:              '📌 기타',
};

interface PartyCardProps {
  venue: VenueCard;
  isSelected?: boolean;
  priority?: boolean;
  onSelect?: (id: string) => void;
}

export default function PartyCard({ venue, isSelected, priority, onSelect }: PartyCardProps) {
  return (
    <div
      className={`bg-surface-alt border rounded-2xl overflow-hidden transition-all duration-200 group cursor-pointer ${
        isSelected
          ? 'border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/15 -translate-y-0.5'
          : 'border-border-subtle hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5'
      }`}
      onClick={() => onSelect?.(venue.id)}
    >
      <div className="relative h-36 overflow-hidden">
        <Image
          src={venue.imageUrl}
          alt={venue.title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide text-white shadow-sm ${CATEGORY_COLORS[venue.category]}`}>
          {CATEGORY_LABELS[venue.category]}
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-sm font-bold text-white">
          ₩{venue.price.toLocaleString()}
        </div>
      </div>

      <div className="p-3.5 space-y-1.5">
        <h3 className="font-bold text-sm text-text line-clamp-1 group-hover:text-primary transition-colors">
          {venue.title}
        </h3>
        <div className="flex items-center text-xs text-text-secondary">
          <MapPin className="w-3 h-3 mr-1.5 shrink-0 text-primary/60" />
          <span className="truncate">{venue.location.name}</span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex gap-1">
            {venue.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] bg-tag-bg text-text-muted px-1.5 py-0.5 rounded-full border border-border-subtle">
                #{tag}
              </span>
            ))}
          </div>
          <a
            href={venue.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover px-2 py-0.5 rounded-lg hover:bg-primary-subtle transition-all"
          >
            상세보기 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
