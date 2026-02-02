import React from 'react';
import { MapPin, Calendar, Users, ExternalLink } from 'lucide-react';
import { Party } from '@/types/Party';

interface PartyCardProps {
  party: Party;
  onClick?: () => void;
}

const PartyCard: React.FC<PartyCardProps> = ({ party, onClick }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Guesthouse': return 'bg-rose-500';
      case 'Socialing': return 'bg-indigo-500';
      case 'Club': return 'bg-fuchsia-500';
      case 'Workshop': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div 
      className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-indigo-500 transition-all cursor-pointer group flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={party.imageUrl} 
          alt={party.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white ${getCategoryColor(party.category)}`}>
          {party.category}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-sm font-semibold text-white">
          ₩{party.price.toLocaleString()}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-bold text-slate-100 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
          {party.title}
        </h3>
        
        <div className="space-y-1.5 mt-1">
          <div className="flex items-center text-xs text-slate-400">
            <MapPin className="w-3 h-3 mr-1.5 text-indigo-400" />
            <span className="truncate">{party.location.name}</span>
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <Calendar className="w-3 h-3 mr-1.5 text-indigo-400" />
            <span>{party.date} ({party.time})</span>
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <Users className="w-3 h-3 mr-1.5 text-indigo-400" />
            <span>연령: {party.ageRange} {party.genderRatio && `· ${party.genderRatio}`}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mt-2 italic">
          &quot;{party.description}&quot;
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-700/50">
          <div className="flex gap-1">
            {party.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
          <a 
            href={party.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-semibold"
          >
            예약하기 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PartyCard;
