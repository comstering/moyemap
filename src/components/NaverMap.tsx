'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Party } from '@/types/party';
import { useTheme } from './ThemeProvider';

const MARKER_COLORS: Record<Party['category'], { bg: string; border: string }> = {
  social: { bg: '#FF6B6B', border: '#E55A5A' },
  bar: { bg: '#f59e0b', border: '#d97706' },
  guesthouse: { bg: '#8B5CF6', border: '#7C3AED' },
  networking: { bg: '#10b981', border: '#059669' },
};

const MARKER_COLORS_DARK: Record<Party['category'], { bg: string; border: string }> = {
  social: { bg: '#FF8787', border: '#FF6B6B' },
  bar: { bg: '#fbbf24', border: '#f59e0b' },
  guesthouse: { bg: '#A78BFA', border: '#8B5CF6' },
  networking: { bg: '#34d399', border: '#10b981' },
};

const CATEGORY_ICONS: Record<Party['category'], string> = {
  social: '\u{1F389}',
  bar: '\u{1F37A}',
  guesthouse: '\u{1F3E0}',
  networking: '\u{1F91D}',
};

const CATEGORY_LABELS: Record<Party['category'], string> = {
  social: '소셜파티',
  bar: '혼술바',
  guesthouse: '게하파티',
  networking: '네트워킹',
};

interface NaverMapProps {
  parties: Party[];
  selectedPartyId?: string | null;
  onPartySelect: (party: Party) => void;
  onBoundsChange?: (bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }) => void;
}

function createMarkerContent(party: Party, isSelected: boolean, isHovered: boolean, isDark: boolean) {
  const colors = isDark ? MARKER_COLORS_DARK[party.category] : MARKER_COLORS[party.category];
  const icon = CATEGORY_ICONS[party.category];
  const active = isSelected || isHovered;
  const scale = active ? 1.15 : 1;
  const priceText = `\u{20A9}${(party.price / 10000).toFixed(party.price % 10000 === 0 ? 0 : 1)}만`;

  return `
    <div style="transform:scale(${scale});transition:transform 0.2s ease;cursor:pointer;filter:drop-shadow(0 4px 10px rgba(0,0,0,${isDark ? '0.5' : '0.25'}));">
      <div style="
        display:flex;align-items:center;gap:4px;
        background:${colors.bg};
        color:#fff;
        padding:6px 10px;
        border-radius:20px;
        border:2.5px solid ${active ? '#fff' : colors.border};
        font-family:system-ui,-apple-system,sans-serif;
        font-size:12px;font-weight:800;
        white-space:nowrap;
        box-shadow:${active ? '0 0 0 3px ' + colors.bg + '60' : 'none'};
      ">
        <span style="font-size:14px;line-height:1;">${icon}</span>
        <span>${priceText}</span>
      </div>
      <div style="
        width:0;height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-top:8px solid ${colors.bg};
        margin:0 auto;
        margin-top:-1px;
      "></div>
    </div>
  `;
}

function createInfoContent(party: Party, isDark: boolean) {
  const colors = isDark ? MARKER_COLORS_DARK[party.category] : MARKER_COLORS[party.category];
  const bg = isDark ? '#18191A' : '#ffffff';
  const textPrimary = isDark ? '#E4E6EB' : '#2B2B2B';
  const textSecondary = isDark ? '#a0a3a8' : '#636e72';
  const borderColor = isDark ? '#3a3b3c' : '#e8e8e8';

  return `
    <div onclick="window.__navigateToParty('${party.id}')" style="padding:14px 18px;min-width:220px;font-family:system-ui,-apple-system,sans-serif;background:${bg};border-radius:12px;border:1px solid ${borderColor};box-shadow:0 8px 24px rgba(0,0,0,${isDark ? '0.4' : '0.12'});cursor:pointer;transition:border-color 0.2s;" onmouseover="this.style.borderColor='${colors.bg}'" onmouseout="this.style.borderColor='${borderColor}'">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span style="font-size:16px;">${CATEGORY_ICONS[party.category]}</span>
        <span style="font-size:11px;font-weight:700;color:${colors.bg};text-transform:uppercase;letter-spacing:0.05em;">
          ${CATEGORY_LABELS[party.category]}
        </span>
      </div>
      <div style="font-size:15px;font-weight:700;color:${textPrimary};margin-bottom:8px;line-height:1.3;">
        ${party.title}
      </div>
      <div style="font-size:12px;color:${textSecondary};margin-bottom:6px;">
        ${party.date} · ${party.time}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:18px;font-weight:800;color:${colors.bg};">
          \u{20A9}${party.price.toLocaleString()}
        </span>
        <span style="font-size:11px;color:${textSecondary};font-weight:600;">상세보기 →</span>
      </div>
    </div>
  `;
}

const DEFAULT_CENTER = { lat: 37.5175, lng: 126.9674 };

export default function NaverMap({
  parties,
  selectedPartyId,
  onPartySelect,
  onBoundsChange,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  const infoWindowsRef = useRef<Map<string, naver.maps.InfoWindow>>(new Map());
  const openInfoPartyIdRef = useRef<string | null>(null);
  const [showResearch, setShowResearch] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  // Initialize map & cleanup on unmount
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
      setShowResearch(true);
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          sw: { lat: bounds.getMin().lat(), lng: bounds.getMin().lng() },
          ne: { lat: bounds.getMax().lat(), lng: bounds.getMax().lng() },
        });
      }
    });

    // Click on empty map area → close info window
    naver.maps.Event.addListener(map, 'click', () => {
      if (openInfoPartyIdRef.current) {
        const iw = infoWindowsRef.current.get(openInfoPartyIdRef.current);
        if (iw) iw.close();
        openInfoPartyIdRef.current = null;
      }
    });

    return () => {
      map.destroy();
      mapInstanceRef.current = null;
      markersRef.current.clear();
      infoWindowsRef.current.clear();
      openInfoPartyIdRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create markers when parties or theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers & info windows
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();
    infoWindowsRef.current.forEach((iw) => iw.close());
    infoWindowsRef.current.clear();
    openInfoPartyIdRef.current = null;

    const isDark = theme === 'dark';

    parties.forEach((party) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(party.location.lat, party.location.lng),
        map,
        icon: {
          content: createMarkerContent(party, false, false, isDark),
          size: new naver.maps.Size(80, 50),
          anchor: new naver.maps.Point(40, 50),
        },
        zIndex: 10,
      });

      const infoWindow = new naver.maps.InfoWindow({
        content: createInfoContent(party, isDark),
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        anchorSize: new naver.maps.Size(0, 0),
        pixelOffset: new naver.maps.Point(0, -8),
      });

      naver.maps.Event.addListener(marker, 'click', () => {
        // Close previously open info window
        if (openInfoPartyIdRef.current && openInfoPartyIdRef.current !== party.id) {
          const prevIw = infoWindowsRef.current.get(openInfoPartyIdRef.current);
          if (prevIw) prevIw.close();
        }

        if (openInfoPartyIdRef.current === party.id) {
          // Toggle off if clicking same marker
          infoWindow.close();
          openInfoPartyIdRef.current = null;
        } else {
          infoWindow.open(map, marker);
          openInfoPartyIdRef.current = party.id;
        }

        onPartySelect(party);
      });

      markersRef.current.set(party.id, marker);
      infoWindowsRef.current.set(party.id, infoWindow);
    });
  }, [parties, theme, onPartySelect]);

  // Update marker appearance for selection (without recreating)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const isDark = theme === 'dark';

    parties.forEach((party) => {
      const marker = markersRef.current.get(party.id);
      if (!marker) return;

      const isSelected = party.id === selectedPartyId;

      marker.setIcon({
        content: createMarkerContent(party, isSelected, false, isDark),
        size: new naver.maps.Size(80, 50),
        anchor: new naver.maps.Point(40, 50),
      });
      marker.setZIndex(isSelected ? 200 : 10);
    });
  }, [selectedPartyId, parties, theme]);

  // Pan to selected party & open its info window
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPartyId) return;

    const party = parties.find((p) => p.id === selectedPartyId);
    if (!party) return;

    map.panTo(
      new naver.maps.LatLng(party.location.lat, party.location.lng),
      { duration: 300 }
    );

    // Close previous info window if different
    if (openInfoPartyIdRef.current && openInfoPartyIdRef.current !== selectedPartyId) {
      const prevIw = infoWindowsRef.current.get(openInfoPartyIdRef.current);
      if (prevIw) prevIw.close();
    }

    // Open info window for selected party
    const marker = markersRef.current.get(selectedPartyId);
    const infoWindow = infoWindowsRef.current.get(selectedPartyId);
    if (marker && infoWindow && openInfoPartyIdRef.current !== selectedPartyId) {
      infoWindow.open(map, marker);
      openInfoPartyIdRef.current = selectedPartyId;
    }
  }, [selectedPartyId, parties]);

  // Global callback for InfoWindow clicks → Next.js client-side navigation
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__navigateToParty = (id: string) => {
      routerRef.current.push(`/party/${id}`);
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__navigateToParty;
    };
  }, []);

  const handleResearch = useCallback(() => {
    setShowResearch(false);
  }, []);

  if (typeof window !== 'undefined' && !window.naver?.maps) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface text-text-secondary">
        <div className="text-center space-y-2">
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
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface-alt text-text px-5 py-2.5 rounded-full text-xs font-bold shadow-lg border border-border hover:bg-surface-elevated transition-all z-10"
        >
          이 지역에서 다시 검색
        </button>
      )}
    </div>
  );
}
