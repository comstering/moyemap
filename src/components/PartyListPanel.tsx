'use client';

import { useState, useRef, useEffect } from 'react';
import { List, ArrowUpDown } from 'lucide-react';
import { Party } from '@/types/party';
import PartyCard from './PartyCard';

type SortOption = 'price-asc' | 'price-desc' | 'date';

interface PartyListPanelProps {
  parties: Party[];
  selectedPartyId?: string | null;
  onPartySelect?: (party: Party) => void;
}

export default function PartyListPanel({ parties, selectedPartyId, onPartySelect }: PartyListPanelProps) {
  const [sort, setSort] = useState<SortOption>('date');
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!selectedPartyId || !listRef.current) return;
    const card = cardRefs.current.get(selectedPartyId);
    const container = listRef.current;
    if (card) {
      const cardTop = card.offsetTop - container.offsetTop;
      const scrollTarget = cardTop - container.clientHeight / 2 + card.clientHeight / 2;
      container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  }, [selectedPartyId]);

  const sorted = [...parties].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'date':
      default:
        return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    }
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="text-sm font-bold text-text flex items-center gap-2">
          <List className="w-4 h-4 text-primary" />
          모임 목록
          <span className="text-xs font-medium text-text-muted">({parties.length})</span>
        </h2>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3 text-text-muted" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-transparent text-xs text-text-secondary border-none outline-none cursor-pointer"
          >
            <option value="date">날짜순</option>
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
          </select>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-text-muted">
            조건에 맞는 모임이 없습니다
          </div>
        ) : (
          sorted.map((party, index) => (
            <div
              key={party.id}
              ref={(el) => { if (el) cardRefs.current.set(party.id, el); }}
            >
              <PartyCard party={party} isSelected={party.id === selectedPartyId} priority={index < 3} onSelect={onPartySelect} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
