'use client';

import { CategoryFilter, DateFilter, PriceFilter } from '@/types/party';

interface QuickFiltersProps {
  category: CategoryFilter;
  dateFilter: DateFilter;
  priceFilter: PriceFilter;
  region: string;
  regions: readonly string[];
  onCategoryChange: (v: CategoryFilter) => void;
  onDateChange: (v: DateFilter) => void;
  onPriceChange: (v: PriceFilter) => void;
  onRegionChange: (v: string) => void;
}

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'social', label: '소셜파티' },
  { value: 'bar', label: '혼술바' },
  { value: 'guesthouse', label: '게하파티' },
  { value: 'networking', label: '네트워킹' },
];

const DATES: { value: DateFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'today', label: '오늘' },
  { value: 'tomorrow', label: '내일' },
  { value: 'weekend', label: '이번 주말' },
];

const PRICES: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'under30k', label: '3만원 미만' },
  { value: '30k-50k', label: '3~5만원' },
  { value: 'over50k', label: '5만원 이상' },
];

function FilterChip<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            value === item.value
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary-glow'
              : 'bg-surface-alt border-border text-text-secondary hover:bg-surface-elevated hover:text-text'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function QuickFilters({
  category,
  dateFilter,
  priceFilter,
  region,
  regions,
  onCategoryChange,
  onDateChange,
  onPriceChange,
  onRegionChange,
}: QuickFiltersProps) {
  return (
    <div className="space-y-3">
      <FilterChip items={CATEGORIES} value={category} onChange={onCategoryChange} />
      <FilterChip items={DATES} value={dateFilter} onChange={onDateChange} />
      <FilterChip items={PRICES} value={priceFilter} onChange={onPriceChange} />
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => onRegionChange(r)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
              region === r
                ? 'bg-primary-subtle border-primary/30 text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
