'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { VenueMarker, VenueCategory } from '@/types/venue';
import { useTheme } from './ThemeProvider';

const MARKER_COLORS: Record<VenueCategory, { bg: string; border: string }> = {
  SOCIAL_PARTY:      { bg: '#FF6B6B', border: '#E55A5A' },
  SOLO_PARTY:        { bg: '#FF8C42', border: '#E57A35' },
  GUESTHOUSE_PARTY:  { bg: '#A855F7', border: '#9333EA' },
  ROTATION_DATING:   { bg: '#EC4899', border: '#DB2777' },
  NETWORKING:        { bg: '#10B981', border: '#059669' },
  HONSOOL_BAR:       { bg: '#F59E0B', border: '#D97706' },
  BAR:               { bg: '#F59E0B', border: '#D97706' },
  WORKSHOP:          { bg: '#3B82F6', border: '#2563EB' },
  ETC:               { bg: '#6B7280', border: '#4B5563' },
};

const MARKER_COLORS_DARK: Record<VenueCategory, { bg: string; border: string }> = {
  SOCIAL_PARTY:      { bg: '#FF8787', border: '#FF6B6B' },
  SOLO_PARTY:        { bg: '#FFA06B', border: '#FF8C42' },
  GUESTHOUSE_PARTY:  { bg: '#C084FC', border: '#A855F7' },
  ROTATION_DATING:   { bg: '#F472B6', border: '#EC4899' },
  NETWORKING:        { bg: '#34D399', border: '#10B981' },
  HONSOOL_BAR:       { bg: '#FBBF24', border: '#F59E0B' },
  BAR:               { bg: '#FBBF24', border: '#F59E0B' },
  WORKSHOP:          { bg: '#60A5FA', border: '#3B82F6' },
  ETC:               { bg: '#9CA3AF', border: '#6B7280' },
};

const CATEGORY_ICONS: Record<VenueCategory, string> = {
  SOCIAL_PARTY:     '🎉',
  SOLO_PARTY:       '🎊',
  GUESTHOUSE_PARTY: '🏠',
  ROTATION_DATING:  '💕',
  NETWORKING:       '🤝',
  HONSOOL_BAR:      '🍺',
  BAR:              '🍸',
  WORKSHOP:         '🔧',
  ETC:              '📌',
};

const CATEGORY_LABELS: Record<VenueCategory, string> = {
  SOCIAL_PARTY:     '소셜파티',
  SOLO_PARTY:       '솔로파티',
  GUESTHOUSE_PARTY: '게하파티',
  ROTATION_DATING:  '로데이션',
  NETWORKING:       '네트워킹',
  HONSOOL_BAR:      '혼술바',
  BAR:              '바',
  WORKSHOP:         '워크샵',
  ETC:              '기타',
};

type Bounds = { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } };
interface NaverMapProps {
  markers: VenueMarker[];
  selectedVenueId?: string | null;
  onVenueSelect: (id: string) => void;
  onBoundsChange?: (bounds: Bounds) => void;
}

const createMarkerContent = (marker: VenueMarker, isSelected: boolean, isHovered: boolean, isDark: boolean) => {
  const colors = isDark ? MARKER_COLORS_DARK[marker.category] : MARKER_COLORS[marker.category];
  const icon = CATEGORY_ICONS[marker.category];
  const active = isSelected || isHovered;
  const priceText = marker.minPrice == null
    ? '금액확인중'
    : `₩${(marker.minPrice / 10000).toFixed(marker.minPrice % 10000 === 0 ? 0 : 1)}만~`;

  const outerStyle = isSelected
    ? `animation: markerBounce 1.5s ease-in-out infinite; cursor:pointer; filter:drop-shadow(0 6px 14px rgba(0,0,0,${isDark ? '0.6' : '0.35'}));`
    : `transform:scale(${active ? 1.12 : 1}); transition:transform 0.2s ease; cursor:pointer; filter:drop-shadow(0 4px 10px rgba(0,0,0,${isDark ? '0.5' : '0.25'}));`;

  return `
    <div style="${outerStyle}">
      <div style="
        display:flex;align-items:center;gap:4px;
        background:${colors.bg};
        color:#fff;
        padding:5px 10px;
        border-radius:20px;
        border:2.5px solid ${active ? '#fff' : colors.border};
        font-family:system-ui,-apple-system,sans-serif;
        font-size:12px;font-weight:800;
        white-space:nowrap;
        box-shadow:${active ? '0 0 0 3px ' + colors.bg + '55' : 'none'};
      ">
        <span style="font-size:13px;line-height:1;">${icon}</span>
        <span>${priceText}</span>
      </div>
      <div style="
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:7px solid ${colors.bg};
        margin:0 auto;margin-top:-1px;
      "></div>
    </div>
  `;
};

const createInfoContent = (marker: VenueMarker, isDark: boolean) => {
  const colors = isDark ? MARKER_COLORS_DARK[marker.category] : MARKER_COLORS[marker.category];
  const bg = isDark ? '#18191A' : '#ffffff';
  const textPrimary = isDark ? '#E4E6EB' : '#2B2B2B';
  const textSecondary = isDark ? '#a0a3a8' : '#636e72';
  const borderColor = isDark ? '#3a3b3c' : '#e8e8e8';
  return `
    <div style="padding:14px 16px;min-width:220px;max-width:260px;font-family:system-ui,-apple-system,sans-serif;background:${bg};border-radius:14px;border:1px solid ${borderColor};box-shadow:0 8px 28px rgba(0,0,0,${isDark ? '0.45' : '0.14'});">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;">
        <span style="font-size:15px;">${CATEGORY_ICONS[marker.category]}</span>
        <span style="font-size:10px;font-weight:700;color:${colors.bg};letter-spacing:0.04em;">${CATEGORY_LABELS[marker.category]}</span>
      </div>
      <div style="font-size:14px;font-weight:700;color:${textPrimary};margin-bottom:6px;line-height:1.35;">${marker.title}</div>
      <div style="font-size:11px;color:${textSecondary};margin-bottom:10px;">📍 ${marker.region}</div>
      <div style="font-size:18px;font-weight:800;color:${textPrimary};">${marker.minPrice == null ? '금액확인중' : '₩' + marker.minPrice.toLocaleString() + '~'}</div>
    </div>
  `;
};

const DEFAULT_CENTER = { lat: 37.5175, lng: 126.9674 };

const NaverMap = ({
  markers,
  selectedVenueId,
  onVenueSelect,
  onBoundsChange,
}: NaverMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  const infoWindowsRef = useRef<Map<string, naver.maps.InfoWindow>>(new Map());
  const openInfoVenueIdRef = useRef<string | null>(null);
  const currentBoundsRef = useRef<Bounds | null>(null);
  const isFirstIdleRef = useRef(true);
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;
  const [showResearch, setShowResearch] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps) return;

    const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
      zoomControlOptions: { position: 3 },
    });

    mapInstanceRef.current = map;

    naver.maps.Event.addListener(map, 'idle', () => {
      const b = map.getBounds();
      const bounds: Bounds = {
        sw: { lat: b.getMin().lat(), lng: b.getMin().lng() },
        ne: { lat: b.getMax().lat(), lng: b.getMax().lng() },
      };
      currentBoundsRef.current = bounds;

      if (isFirstIdleRef.current) {
        isFirstIdleRef.current = false;
        onBoundsChangeRef.current?.(bounds);
      } else {
        setShowResearch(true);
      }
    });

    naver.maps.Event.addListener(map, 'click', () => {
      if (openInfoVenueIdRef.current) {
        const iw = infoWindowsRef.current.get(openInfoVenueIdRef.current);
        if (iw) iw.close();
        openInfoVenueIdRef.current = null;
      }
    });

    return () => {
      map.destroy();
      mapInstanceRef.current = null;
      markersRef.current.clear();
      infoWindowsRef.current.clear();
      openInfoVenueIdRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();
    infoWindowsRef.current.forEach((iw) => iw.close());
    infoWindowsRef.current.clear();
    openInfoVenueIdRef.current = null;

    const isDark = theme === 'dark';

    markers.forEach((marker) => {
      const mapMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(marker.latitude, marker.longitude),
        map,
        icon: {
          content: createMarkerContent(marker, false, false, isDark),
          size: new naver.maps.Size(80, 50),
          anchor: new naver.maps.Point(40, 50),
        },
        zIndex: 10,
      });

      const infoWindow = new naver.maps.InfoWindow({
        content: createInfoContent(marker, isDark),
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        anchorSize: new naver.maps.Size(0, 0),
        pixelOffset: new naver.maps.Point(0, -8),
      });

      naver.maps.Event.addListener(mapMarker, 'click', () => {
        if (openInfoVenueIdRef.current && openInfoVenueIdRef.current !== marker.id) {
          const prevIw = infoWindowsRef.current.get(openInfoVenueIdRef.current);
          if (prevIw) prevIw.close();
        }

        if (openInfoVenueIdRef.current === marker.id) {
          infoWindow.close();
          openInfoVenueIdRef.current = null;
        } else {
          infoWindow.open(map, mapMarker);
          openInfoVenueIdRef.current = marker.id;
        }

        onVenueSelect(marker.id);
      });

      markersRef.current.set(marker.id, mapMarker);
      infoWindowsRef.current.set(marker.id, infoWindow);
    });
  }, [markers, theme, onVenueSelect]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const isDark = theme === 'dark';

    markers.forEach((marker) => {
      const mapMarker = markersRef.current.get(marker.id);
      if (!mapMarker) return;
      const isSelected = marker.id === selectedVenueId;
      mapMarker.setIcon({
        content: createMarkerContent(marker, isSelected, false, isDark),
        size: new naver.maps.Size(80, 50),
        anchor: new naver.maps.Point(40, 50),
      });
      mapMarker.setZIndex(isSelected ? 200 : 10);
    });
  }, [selectedVenueId, markers, theme]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVenueId) return;

    const marker = markers.find((m) => m.id === selectedVenueId);
    if (!marker) return;

    map.panTo(new naver.maps.LatLng(marker.latitude, marker.longitude), { duration: 300 });

    if (openInfoVenueIdRef.current && openInfoVenueIdRef.current !== selectedVenueId) {
      const prevIw = infoWindowsRef.current.get(openInfoVenueIdRef.current);
      if (prevIw) prevIw.close();
    }

    const mapMarker = markersRef.current.get(selectedVenueId);
    const infoWindow = infoWindowsRef.current.get(selectedVenueId);
    if (mapMarker && infoWindow && openInfoVenueIdRef.current !== selectedVenueId) {
      infoWindow.open(map, mapMarker);
      openInfoVenueIdRef.current = selectedVenueId;
    }
  }, [selectedVenueId, markers]);

  const handleResearch = useCallback(() => {
    setShowResearch(false);
    if (currentBoundsRef.current) {
      onBoundsChangeRef.current?.(currentBoundsRef.current);
    }
  }, []);

  if (typeof window !== 'undefined' && !window.naver?.maps) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface text-text-secondary">
        <div className="text-center space-y-2">
          <p className="text-2xl">🗺️</p>
          <p className="text-sm font-medium">지도를 불러오는 중...</p>
          <p className="text-xs text-text-muted">NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수를 확인해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {showResearch && (
        <button
          onClick={handleResearch}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface-panel/90 backdrop-blur-md text-text px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-border hover:bg-surface-elevated transition-all z-10"
        >
          이 지역에서 다시 검색
        </button>
      )}
    </div>
  );
};
export default NaverMap;
