'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'moyemap_disclaimer_v1';

export default function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface-panel border border-border rounded-2xl shadow-2xl overflow-hidden">

        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-primary" />

        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-text leading-tight">서비스 이용 안내</h2>
              <p className="text-[11px] text-text-muted mt-0.5">모여맵 이용 전 반드시 확인해 주세요</p>
            </div>
          </div>

          {/* 본문 */}
          <div className="space-y-3 text-[13px] text-text-secondary leading-relaxed">
            <p>
              모여맵은 소셜 모임·파티 정보를 제공하는 정보 제공 목적의 서비스입니다.
            </p>

            <ul className="rounded-xl bg-surface-alt border border-border p-3.5 space-y-2.5 list-none">
              <li className="flex gap-2">
                <span className="text-amber-400 shrink-0 mt-px">•</span>
                <span>표시된 <span className="text-amber-400">금액은 참고용</span>이며, 실제 가격과 다를 수 있습니다. 금액에 대한 정확성을 보장하지 않습니다.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 shrink-0 mt-px">•</span>
                <span><span className="text-amber-400">장소·일정·참가 자격</span> 등 세부 정보는 변경될 수 있으며, 모여맵은 해당 정보의 정확성에 대해 책임지지 않습니다.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 shrink-0 mt-px">•</span>
                <span>정확한 정보 확인 및 예약은 반드시 <span className="text-amber-400">각 파티·행사의 공식 사이트</span>에서 직접 진행해 주세요.</span>
              </li>
            </ul>

            <p className="text-[11px] text-text-muted">
              본 안내를 확인하고 동의하시면 서비스를 이용하실 수 있습니다.
            </p>
          </div>

          {/* 버튼 */}
          <button
            onClick={handleConfirm}
            className="mt-5 w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}
