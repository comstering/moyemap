'use client';

import { MapPin, Calendar, Clock, ExternalLink } from 'lucide-react';
import { Party } from '@/types/party';
import Image from 'next/image';
import Link from 'next/link';

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

interface PartyCardProps {
  party: Party;
  isSelected?: boolean;
  priority?: boolean;
  onSelect?: (party: Party) => void;
}

export default function PartyCard({ party, isSelected, priority, onSelect }: PartyCardProps) {
  return (
    <div
      className={`bg-surface-alt border rounded-2xl overflow-hidden hover:border-primary/50 transition-all group shadow-sm cursor-pointer ${
        isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border-subtle'
      }`}
      onClick={() => onSelect?.(party)}
    >
      <div className="relative h-36 overflow-hidden">
        <Image
          src={party.imageUrl}
          alt={party.title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white ${CATEGORY_COLORS[party.category]}`}>
          {CATEGORY_LABELS[party.category]}
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-sm font-bold text-white">
          ₩{party.price.toLocaleString()}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-bold text-text line-clamp-1 group-hover:text-primary transition-colors">
          {party.title}
        </h3>
        <div className="space-y-1">
          <div className="flex items-center text-xs text-text-secondary">
            <MapPin className="w-3 h-3 mr-1.5 text-primary/70" />
            <span className="truncate">{party.location.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1.5 text-primary/70" />
              {party.date}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1.5 text-primary/70" />
              {party.time}
            </span>
          </div>
        </div>
        {party.ageRange && (
          <p className="text-[11px] text-text-muted">
            {party.ageRange}{party.genderRatio ? ` · 성비 ${party.genderRatio}` : ''}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1.5">
            {party.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-tag-bg text-text-secondary px-1.5 py-0.5 rounded-full border border-border-subtle">
                #{tag}
              </span>
            ))}
          </div>
          <Link
            href={`/party/${party.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors"
          >
            상세보기 <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
