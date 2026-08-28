import { useState, useEffect } from 'react';
import { Sponsor } from '../types';
import { API } from '../services/api';
import { ExternalLink, Award, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  sponsors: Sponsor[];
}

export function RollingSponsorBanner({ sponsors }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeSponsors = sponsors.filter(s => s.status === 'ACTIVE');

  useEffect(() => {
    if (activeSponsors.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeSponsors.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSponsors.length]);

  if (activeSponsors.length === 0) return null;

  const current = activeSponsors[currentIndex];

  const handleLinkClick = (type: 'website' | 'instagram' | 'youtube', url?: string) => {
    if (!url) return;
    if (type === 'website') API.trackSponsorEvent(current.sponsorId, 'websiteClick');
    if (type === 'instagram') API.trackSponsorEvent(current.sponsorId, 'instagramClick');
    if (type === 'youtube') API.trackSponsorEvent(current.sponsorId, 'youtubeClick');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getTierBadge = (tier: Sponsor['tier']) => {
    switch (tier) {
      case 'PRESENTED_BY':
        return { text: 'PRESENTED BY', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'POWERED_BY':
        return { text: 'POWERED BY', bg: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'SPONSORED_BY':
        return { text: 'SPONSORED BY', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      default:
        return { text: 'OFFICIAL PARTNER', bg: 'bg-slate-700/50 text-slate-300 border-slate-600/30' };
    }
  };

  const badge = getTierBadge(current.tier);

  return (
    <div id="tmt-rolling-sponsor-banner" className="w-full bg-[#0d121c] border-y border-amber-500/20 py-2.5 px-4 overflow-hidden relative shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Side: Sponsor Branding & Info */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="relative shrink-0">
            <img
              src={current.logoUrl}
              alt={current.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover border border-amber-500/30 shadow"
            />
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border uppercase ${badge.bg}`}>
                {badge.text}
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide truncate">{current.name}</h4>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md hidden md:block mt-0.5">
              {current.description}
            </p>
          </div>
        </div>

        {/* Right Side: Social & Web CTAs + Carousel Indicators */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {current.websiteUrl && (
            <button
              id={`sponsor-cta-web-${current.sponsorId}`}
              onClick={() => handleLinkClick('website', current.websiteUrl)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Visit Official Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {current.instagramUrl && (
            <button
              id={`sponsor-cta-ig-${current.sponsorId}`}
              onClick={() => handleLinkClick('instagram', current.instagramUrl)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-pink-400 text-xs font-semibold rounded border border-slate-700 transition active:scale-95 cursor-pointer"
              title="Instagram Page"
            >
              IG
            </button>
          )}

          {current.youtubeUrl && (
            <button
              id={`sponsor-cta-yt-${current.sponsorId}`}
              onClick={() => handleLinkClick('youtube', current.youtubeUrl)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-semibold rounded border border-slate-700 transition active:scale-95 cursor-pointer"
              title="YouTube Channel"
            >
              YT
            </button>
          )}

          {/* Dots Indicator */}
          {activeSponsors.length > 1 && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-700/60">
              {activeSponsors.map((s, idx) => (
                <button
                  key={s.sponsorId}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to sponsor ${s.name}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
