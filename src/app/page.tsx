'use client';

import { useState, useCallback } from 'react';
import { Map as MapIcon, List } from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import NaverMap from '@/components/NaverMap';
import QuickFilters from '@/components/QuickFilters';
import PartyListPanel from '@/components/PartyListPanel';
import PartyCard from '@/components/PartyCard';
import DisclaimerModal from '@/components/DisclaimerModal';
import { GET_VENUE_MARKERS, GET_VENUES } from '@/lib/graphql/queries';
import { CategoryFilter, PriceFilter, VenueCard, VenueCategory, VenueMarker, priceFilterToRange } from '@/types/venue';
import { CATEGORY_FILTER_OPTIONS, REGIONS } from '@/lib/venue-constants';

type Bounds = { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } };

// 서울 전체를 포함하는 초기 bounds — 지도 idle 전에도 쿼리가 발사되도록
const SEOUL_DEFAULT_BOUNDS: Bounds = {
  sw: { lat: 37.41, lng: 126.76 },
  ne: { lat: 37.70, lng: 127.18 },
};

export default function HomePage() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [region, setRegion] = useState('전체');
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [mapBounds, setMapBounds] = useState<Bounds>(SEOUL_DEFAULT_BOUNDS);

  const categoriesInput = category === 'all' ? undefined : [category as VenueCategory];
  const regionInput = region === '전체' ? undefined : region;
  const priceRange = priceFilterToRange(priceFilter);

  const boundsInput = {
    northEastLatitude: mapBounds.ne.lat,
    northEastLongitude: mapBounds.ne.lng,
    southWestLatitude: mapBounds.sw.lat,
    southWestLongitude: mapBounds.sw.lng,
  };

  const { data: markersData } = useQuery<{ venueMarkers: VenueMarker[] }>(GET_VENUE_MARKERS, {
    variables: { input: { ...boundsInput, categories: categoriesInput, region: regionInput } },
  });

  const { data: venuesData, loading: venuesLoading } = useQuery<{ venues: VenueCard[] }>(GET_VENUES, {
    variables: { input: { ...boundsInput, categories: categoriesInput, region: regionInput, ...priceRange } },
  });

  const markers = markersData?.venueMarkers ?? [];
  const venues = venuesData?.venues ?? [];

  const handleVenueSelect = useCallback((id: string) => setSelectedVenueId(id), []);

  const handleBoundsChange = useCallback((bounds: Bounds) => setMapBounds(bounds), []);

  return (
    <>
    <DisclaimerModal />
    <div className="flex flex-col h-full overflow-hidden">

      {/* Mobile view toggle */}
      <div className="lg:hidden flex items-center justify-center gap-1 bg-surface-panel/90 border-b border-border py-1.5">
        <button
          onClick={() => setMobileView('map')}
          className={`flex items-center gap-1.5 px-4 py-1 rounded-lg text-xs font-bold transition-all ${
            mobileView === 'map' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text'
          }`}
        >
          <MapIcon className="w-3 h-3" /> 지도
        </button>
        <button
          onClick={() => setMobileView('list')}
          className={`flex items-center gap-1.5 px-4 py-1 rounded-lg text-xs font-bold transition-all ${
            mobileView === 'list' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text'
          }`}
        >
          <List className="w-3 h-3" /> 목록
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-[380px] border-r border-border bg-surface-alt/30">
          <div className="px-4 py-3 border-b border-border">
            <QuickFilters
              category={category}
              priceFilter={priceFilter}
              region={region}
              regions={REGIONS}
              onCategoryChange={setCategory}
              onPriceChange={setPriceFilter}
              onRegionChange={setRegion}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <PartyListPanel
              venues={venues}
              selectedVenueId={selectedVenueId}
              onVenueSelect={handleVenueSelect}
              loading={venuesLoading && !venues.length}
            />
          </div>
        </aside>

        {/* Map */}
        <section className={`flex-1 relative ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
          {/* Floating category filter — mobile only */}
          <div className="lg:hidden absolute top-3 left-0 right-0 z-20 px-3 pointer-events-none">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pointer-events-auto pb-1">
              {CATEGORY_FILTER_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border transition-all shadow-lg ${
                    category === cat.value
                      ? 'bg-primary border-primary text-white'
                      : 'bg-black/65 border-white/15 text-white hover:bg-black/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <NaverMap
            markers={markers}
            selectedVenueId={selectedVenueId}
            onVenueSelect={handleVenueSelect}
            onBoundsChange={handleBoundsChange}
          />
        </section>

        {/* Mobile list view */}
        <div className={`lg:hidden absolute inset-0 bg-surface flex flex-col ${mobileView === 'list' ? 'block' : 'hidden'}`}>
          <div className="px-4 py-3 border-b border-border">
            <QuickFilters
              category={category}
              priceFilter={priceFilter}
              region={region}
              regions={REGIONS}
              onCategoryChange={setCategory}
              onPriceChange={setPriceFilter}
              onRegionChange={setRegion}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <PartyListPanel
              venues={venues}
              selectedVenueId={selectedVenueId}
              onVenueSelect={handleVenueSelect}
              loading={venuesLoading && !venues.length}
            />
          </div>
        </div>

        {/* Mobile bottom sheet */}
        <div
          className={`lg:hidden absolute bottom-0 left-0 right-0 bg-surface-panel/95 backdrop-blur-xl border-t border-border rounded-t-2xl transition-all duration-300 z-40 ${
            mobileView === 'map' ? 'block' : 'hidden'
          } ${bottomSheetOpen ? 'h-[58vh]' : 'h-auto'}`}
        >
          <button
            onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
            className="w-full flex flex-col items-center py-2.5"
          >
            <div className="w-8 h-1 bg-border rounded-full mb-1.5" />
            <span className="text-xs text-text-secondary font-bold">
              {bottomSheetOpen ? '접기' : `이 지역 모임 ${venues.length}개`}
            </span>
          </button>

          {bottomSheetOpen && (
            <div
              className="overflow-y-auto px-3 pb-4 space-y-2.5 custom-scrollbar"
              style={{ maxHeight: 'calc(58vh - 52px)' }}
            >
              {venues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-text-muted">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm font-medium">이 지역에 모임이 없어요</p>
                </div>
              ) : (
                venues.map((venue) => (
                  <PartyCard
                    key={venue.id}
                    venue={venue}
                    isSelected={venue.id === selectedVenueId}
                    onSelect={handleVenueSelect}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
