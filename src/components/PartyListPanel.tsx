'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Navigation } from 'lucide-react';
import { VenueCard } from '@/types/venue';
import PartyCard from './PartyCard';

type SortOption = 'price-asc' | 'price-desc';

interface PartyListPanelProps {
  venues: VenueCard[];
  selectedVenueId?: string | null;
  onVenueSelect?: (id: string) => void;
  loading?: boolean;
}

export default function PartyListPanel({ venues, selectedVenueId, onVenueSelect, loading }: PartyListPanelProps) {
  const [sort, setSort] = useState<SortOption>('price-asc');
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!selectedVenueId || !listRef.current) return;
    const card = cardRefs.current.get(selectedVenueId);
    const container = listRef.current;
    if (card) {
      const scrollTarget = card.offsetTop - container.offsetTop - container.clientHeight / 2 + card.clientHeight / 2;
      container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  }, [selectedVenueId]);

  const sorted = [...venues].sort((a, b) =>
    sort === 'price-desc' ? b.price - a.price : a.price - b.price
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h2 className="text-xs font-bold text-text flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-primary" />
          내 주변 모임
          <span className="text-[11px] font-medium text-text-muted">({venues.length})</span>
        </h2>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3 text-text-muted" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-transparent text-xs text-text-secondary border-none outline-none cursor-pointer"
          >
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
          </select>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-text-muted">
            <span className="text-3xl animate-pulse">🔍</span>
            <p className="text-sm font-medium">모임을 불러오는 중...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-text-muted">
            <span className="text-3xl">🔍</span>
            <p className="text-sm font-medium">이 지역에 모임이 없어요</p>
            <p className="text-xs">지도를 이동해 다른 지역을 탐색해보세요</p>
          </div>
        ) : (
          sorted.map((venue, index) => (
            <div key={venue.id} ref={(el) => { if (el) cardRefs.current.set(venue.id, el); }}>
              <PartyCard
                venue={venue}
                isSelected={venue.id === selectedVenueId}
                priority={index < 3}
                onSelect={onVenueSelect}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
