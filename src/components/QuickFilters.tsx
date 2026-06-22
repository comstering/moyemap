'use client';

import { PriceFilter, VenueCategory } from '@/types/venue';
import { CATEGORY_FILTER_OPTIONS } from '@/lib/venue-constants';

interface QuickFiltersProps {
  selectedCategories: VenueCategory[];
  priceFilter: PriceFilter;
  onCategoryToggle: (cat: VenueCategory) => void;
  onCategoryReset: () => void;
  onPriceChange: (v: PriceFilter) => void;
}

const PRICES: { value: PriceFilter; label: string }[] = [
  { value: 'all',      label: '전체 가격' },
  { value: 'under30k', label: '3만원 미만' },
  { value: '30k-50k',  label: '3~5만원' },
  { value: 'over50k',  label: '5만원 이상' },
];

const chipBase = 'shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border';
const chipActive = 'bg-primary border-primary text-white shadow-md shadow-primary/20';
const chipInactive = 'bg-surface-alt border-border text-text-secondary hover:bg-surface-elevated hover:text-text';

const QuickFilters = ({
  selectedCategories,
  priceFilter,
  onCategoryToggle,
  onCategoryReset,
  onPriceChange,
}: QuickFiltersProps) => {
  return (
    <div className="space-y-2.5">
      {/* 카테고리 — 멀티셀렉트 */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        <button
          onClick={onCategoryReset}
          className={`${chipBase} ${selectedCategories.length === 0 ? chipActive : chipInactive}`}
        >
          전체
        </button>
        {CATEGORY_FILTER_OPTIONS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryToggle(cat.value)}
            className={`${chipBase} ${selectedCategories.includes(cat.value) ? chipActive : chipInactive}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 가격 */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {PRICES.map((p) => (
          <button
            key={p.value}
            onClick={() => onPriceChange(p.value)}
            className={`${chipBase} ${priceFilter === p.value ? chipActive : chipInactive}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
export default QuickFilters;
