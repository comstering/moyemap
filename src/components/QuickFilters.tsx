'use client';

import { CategoryFilter, PriceFilter } from '@/types/venue';
import { CATEGORY_FILTER_OPTIONS } from '@/lib/venue-constants';

interface QuickFiltersProps {
  category: CategoryFilter;
  priceFilter: PriceFilter;
  region: string;
  regions: readonly string[];
  onCategoryChange: (v: CategoryFilter) => void;
  onPriceChange: (v: PriceFilter) => void;
  onRegionChange: (v: string) => void;
}


const PRICES: { value: PriceFilter; label: string }[] = [
  { value: 'all',       label: '전체 가격' },
  { value: 'under30k',  label: '3만원 미만' },
  { value: '30k-50k',   label: '3~5만원' },
  { value: 'over50k',   label: '5만원 이상' },
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
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
            value === item.value
              ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
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
  priceFilter,
  region,
  regions,
  onCategoryChange,
  onPriceChange,
  onRegionChange,
}: QuickFiltersProps) {
  return (
    <div className="space-y-2">
      <FilterChip items={CATEGORY_FILTER_OPTIONS} value={category} onChange={onCategoryChange} />
      <FilterChip items={PRICES} value={priceFilter} onChange={onPriceChange} />
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => onRegionChange(r)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
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
