'use client';

import { useState, useMemo, useCallback } from 'react';
import { Map as MapIcon, List, ChevronUp, ChevronDown } from 'lucide-react';
import NaverMap from '@/components/NaverMap';
import QuickFilters from '@/components/QuickFilters';
import PartyListPanel from '@/components/PartyListPanel';
import PartyCard from '@/components/PartyCard';
import { MOCK_PARTIES, REGIONS } from '@/data/mockParties';
import { CategoryFilter, DateFilter, PriceFilter, Party } from '@/types/party';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function getWeekendDates() {
  const now = new Date();
  const day = now.getDay();
  const sat = new Date(now);
  sat.setDate(now.getDate() + (6 - day));
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  return [sat.toISOString().slice(0, 10), sun.toISOString().slice(0, 10)];
}

export default function HomePage() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [region, setRegion] = useState('전체');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  const filteredParties = useMemo(() => {
    return MOCK_PARTIES.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (region !== '전체' && p.location.region !== region) return false;

      if (dateFilter === 'today' && p.date !== getToday()) return false;
      if (dateFilter === 'tomorrow' && p.date !== getTomorrow()) return false;
      if (dateFilter === 'weekend') {
        const weekendDates = getWeekendDates();
        if (!weekendDates.includes(p.date)) return false;
      }

      if (priceFilter === 'under30k' && p.price >= 30000) return false;
      if (priceFilter === '30k-50k' && (p.price < 30000 || p.price >= 50000)) return false;
      if (priceFilter === 'over50k' && p.price < 50000) return false;

      return true;
    });
  }, [category, dateFilter, priceFilter, region]);

  const handlePartySelect = useCallback((party: Party) => {
    setSelectedParty(party);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Mobile view toggle */}
      <div className="lg:hidden flex items-center justify-center gap-1 bg-surface-panel border-b border-border p-2">
        <button
          onClick={() => setMobileView('map')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mobileView === 'map'
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" /> 지도
        </button>
        <button
          onClick={() => setMobileView('list')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mobileView === 'list'
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          <List className="w-3.5 h-3.5" /> 목록
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-[400px] border-r border-border bg-surface-alt/50">
          <div className="p-5 border-b border-border">
            <QuickFilters
              category={category}
              dateFilter={dateFilter}
              priceFilter={priceFilter}
              region={region}
              regions={REGIONS}
              onCategoryChange={setCategory}
              onDateChange={setDateFilter}
              onPriceChange={setPriceFilter}
              onRegionChange={setRegion}
            />
          </div>
          <PartyListPanel parties={filteredParties} selectedPartyId={selectedParty?.id} onPartySelect={handlePartySelect} />
        </aside>

        {/* Map */}
        <section
          className={`flex-1 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}
        >
          <NaverMap
            parties={filteredParties}
            selectedPartyId={selectedParty?.id}
            onPartySelect={handlePartySelect}
          />
        </section>

        {/* Mobile list view */}
        <div
          className={`lg:hidden absolute inset-0 bg-surface flex flex-col ${
            mobileView === 'list' ? 'block' : 'hidden'
          }`}
        >
          <div className="p-4 border-b border-border">
            <QuickFilters
              category={category}
              dateFilter={dateFilter}
              priceFilter={priceFilter}
              region={region}
              regions={REGIONS}
              onCategoryChange={setCategory}
              onDateChange={setDateFilter}
              onPriceChange={setPriceFilter}
              onRegionChange={setRegion}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <PartyListPanel parties={filteredParties} selectedPartyId={selectedParty?.id} onPartySelect={handlePartySelect} />
          </div>
        </div>

        {/* Mobile bottom sheet (on map view) */}
        <div
          className={`lg:hidden absolute bottom-0 left-0 right-0 bg-surface-panel backdrop-blur-xl border-t border-border rounded-t-3xl transition-all duration-300 z-40 ${
            mobileView === 'map' ? 'block' : 'hidden'
          } ${bottomSheetOpen ? 'h-[60vh]' : 'h-auto'}`}
        >
          <button
            onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
            className="w-full flex flex-col items-center py-3"
          >
            <div className="w-10 h-1 bg-border rounded-full mb-2" />
            <div className="flex items-center gap-1 text-xs text-text-secondary font-bold">
              {bottomSheetOpen ? (
                <>
                  <ChevronDown className="w-3 h-3" /> 접기
                </>
              ) : (
                <>
                  <ChevronUp className="w-3 h-3" /> 모임 {filteredParties.length}개 보기
                </>
              )}
            </div>
          </button>

          {bottomSheetOpen && (
            <div
              className="overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar"
              style={{ maxHeight: 'calc(60vh - 56px)' }}
            >
              {filteredParties.map((party) => (
                <PartyCard key={party.id} party={party} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
