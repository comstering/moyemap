'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Users, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Party } from '@/types/party';

const CATEGORY_COLORS: Record<Party['category'], string> = {
  social: 'bg-primary',
  bar: 'bg-amber-500',
  guesthouse: 'bg-rose-500',
  networking: 'bg-emerald-500',
};

const CATEGORY_LABELS: Record<Party['category'], string> = {
  social: '소셜파티',
  bar: '혼술바',
  guesthouse: '게하파티',
  networking: '네트워킹',
};

export default function PartyDetailContent({ party }: { party: Party }) {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const images = party.images.length > 0 ? party.images : [party.imageUrl];

  const prevImage = () => setCurrentImage((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setCurrentImage((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="h-full overflow-y-auto bg-surface text-text transition-colors">
      {/* Sub-header: back + title */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-2.5 bg-surface-panel backdrop-blur-xl border-b border-border">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface-elevated rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold truncate">{party.title}</h2>
      </div>

      {/* Image slider */}
      <div className="max-w-2xl mx-auto px-5 pt-5">
        <div className="relative w-full aspect-[16/9] bg-surface-alt overflow-hidden rounded-2xl">
          <Image
            src={images[currentImage]}
            alt={party.title}
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentImage ? 'bg-white w-4' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white ${CATEGORY_COLORS[party.category]}`}>
            {CATEGORY_LABELS[party.category]}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        {/* Title & Price */}
        <div>
          <h2 className="text-2xl font-bold leading-tight mb-2">{party.title}</h2>
          <div className="text-3xl font-black text-primary">
            ₩{party.price.toLocaleString()}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-alt border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Calendar className="w-3.5 h-3.5" /> 날짜
            </div>
            <div className="text-sm font-bold">{party.date}</div>
          </div>
          <div className="bg-surface-alt border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Clock className="w-3.5 h-3.5" /> 시간
            </div>
            <div className="text-sm font-bold">{party.time}</div>
          </div>
          <div className="bg-surface-alt border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <MapPin className="w-3.5 h-3.5" /> 위치
            </div>
            <div className="text-sm font-bold">{party.location.name}</div>
          </div>
          <div className="bg-surface-alt border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Users className="w-3.5 h-3.5" /> 대상
            </div>
            <div className="text-sm font-bold">
              {party.ageRange}
              {party.genderRatio && <span className="text-text-secondary text-xs ml-1">({party.genderRatio})</span>}
            </div>
          </div>
        </div>

        {/* Amenities */}
        {party.amenities.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-text-secondary mb-3">제공 내역</h3>
            <div className="flex flex-wrap gap-2">
              {party.amenities.map((a) => (
                <span
                  key={a}
                  className="px-3 py-1.5 bg-primary-subtle border border-primary/20 rounded-lg text-xs font-bold text-primary"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-text-secondary mb-3">소개</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{party.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {party.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-tag-bg text-text-secondary px-2.5 py-1 rounded-full border border-border-subtle"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="sticky bottom-0 bg-surface-panel backdrop-blur-xl pt-4 pb-6 -mx-5 px-5 border-t border-border">
          <a
            href={party.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-primary-glow"
          >
            예약하기 <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
