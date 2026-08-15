import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Filter, Users, User, Calendar, Sparkles } from 'lucide-react';
import { TrustScoreBadge } from '../common/TrustScoreBadge';

export const InteractiveMap = ({
  items = [],
  center = [23.3441, 85.3096],
  radius = 25,
  onItemSelect = () => {},
  selectedItem = null
}) => {
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter items by category/type
  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'users') return item.type === 'user' || !item.type;
    if (activeFilter === 'companions') return item.isCompanion || item.type === 'companion';
    if (activeFilter === 'events') return item.type === 'event' || item.date;
    if (activeFilter === 'marketplace') return item.type === 'marketplace' || item.priceUnit;
    return true;
  });

  return (
    <div className="relative w-full h-[520px] bg-[#E5ECEF] rounded-3xl overflow-hidden shadow-inner border border-slate-200/80 flex flex-col">
      {/* Top Map Action Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Category Filter Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/60 text-xs font-semibold text-slate-700">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition ${activeFilter === 'all' ? 'bg-slate-900 text-white shadow' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            All Pins ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter('users')}
            className={`px-3 py-1.5 rounded-xl transition ${activeFilter === 'users' ? 'bg-brand-teal text-white shadow' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            People
          </button>
          <button
            onClick={() => setActiveFilter('companions')}
            className={`px-3 py-1.5 rounded-xl transition ${activeFilter === 'companions' ? 'bg-brand-coral text-white shadow' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            Companions
          </button>
          <button
            onClick={() => setActiveFilter('events')}
            className={`px-3 py-1.5 rounded-xl transition ${activeFilter === 'events' ? 'bg-amber-500 text-white shadow' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            Events
          </button>
        </div>

        {/* Live Radar Badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/60 text-xs font-bold text-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-coral opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-coral"></span>
          </span>
          <span>Live Radar Range: {radius} km</span>
        </div>
      </div>

      {/* Styled Interactive Map SVG Canvas Representation with Geographic Roads Grid */}
      <div className="relative w-full h-full bg-[#DEE5EC] overflow-hidden select-none">
        {/* Decorative Grid Lines to mimic real cartographic street maps */}
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
              <path d="M 0 40 L 80 40" fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 40 0 L 40 80" fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Main Highway Veins */}
          <path d="M -100 200 Q 300 150 900 350" fill="none" stroke="#FFFFFF" strokeWidth="14" />
          <path d="M -100 200 Q 300 150 900 350" fill="none" stroke="#CBD5E1" strokeWidth="10" />
          <path d="M 250 -50 Q 320 300 650 600" fill="none" stroke="#FFFFFF" strokeWidth="12" />
          <path d="M 250 -50 Q 320 300 650 600" fill="none" stroke="#CBD5E1" strokeWidth="8" />
          <path d="M 100 450 Q 400 380 850 150" fill="none" stroke="#FFFFFF" strokeWidth="10" />
        </svg>

        {/* Center Radar Circle (matches reference image red glowing highlight circle) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          {/* Animated Outer Pulse */}
          <div className="absolute w-[360px] h-[360px] rounded-full bg-brand-coral/10 border-2 border-brand-coral/30 radar-ring" />
          <div className="w-56 h-56 rounded-full bg-brand-coral/20 border-2 border-brand-coral/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-brand-coral text-white shadow-coral flex items-center justify-center mb-1 animate-pulse">
              <Navigation className="w-6 h-6 rotate-45" />
            </div>
            <span className="text-xs font-extrabold text-brand-coralDark tracking-wide uppercase">You Are Here</span>
            <span className="text-[11px] font-medium text-slate-700 bg-white/80 px-2 py-0.5 rounded-full mt-1">
              Found {filteredItems.length} contacts nearby
            </span>
          </div>
        </div>

        {/* Placed Pins on Map */}
        {filteredItems.map((item, idx) => {
          // Calculate dispersed positions around the center
          const angle = (idx * (360 / Math.max(filteredItems.length, 1)) + 25) * (Math.PI / 180);
          const distance = 90 + ((idx % 4) * 45); // Spread across radius
          const topPercent = 50 + (Math.sin(angle) * (distance / 4));
          const leftPercent = 50 + (Math.cos(angle) * (distance / 4));

          const isSelected = selectedItem?._id === item._id;

          const isCompanion = item.isCompanion || item.hourlyRate;
          const isEvent = item.date;

          return (
            <div
              key={item._id || idx}
              style={{ top: `${Math.max(12, Math.min(88, topPercent))}%`, left: `${Math.max(8, Math.min(92, leftPercent))}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group transition-all duration-300"
              onClick={() => onItemSelect(item)}
            >
              {/* Pin Bubble */}
              <div
                className={`relative p-1 rounded-full shadow-lg transition-transform duration-200 hover:scale-125 ${
                  isSelected
                    ? 'ring-4 ring-slate-900 scale-125 bg-slate-900 text-white'
                    : isCompanion
                    ? 'bg-brand-coral text-white shadow-coral'
                    : isEvent
                    ? 'bg-amber-500 text-white shadow-amber-500/40'
                    : 'bg-brand-teal text-white shadow-teal'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center font-bold text-xs overflow-hidden">
                  {item.profileImage ? (
                    <img src={item.profileImage} alt={item.name} className="w-full h-full object-cover" />
                  ) : isEvent ? (
                    <Calendar className="w-4 h-4 text-amber-500" />
                  ) : (
                    <User className="w-4 h-4 text-brand-teal" />
                  )}
                </div>
              </div>

              {/* Hover Tooltip Popup */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-40">
                <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap flex flex-col gap-0.5 items-center">
                  <span className="font-bold">{item.name || item.title}</span>
                  <span className="text-[10px] text-slate-300">
                    {isCompanion ? `Companion • ₹${item.hourlyRate}/hr` : isEvent ? `Event • ${item.time || 'Upcoming'}` : item.city || 'Nearby User'}
                  </span>
                </div>
                <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Item Quick View Overlay Card at bottom of map */}
      {selectedItem && (
        <div className="absolute bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200/80 flex items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-lg border border-slate-200 overflow-hidden shrink-0">
              {selectedItem.profileImage ? (
                <img src={selectedItem.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{(selectedItem.name || selectedItem.title || 'U')[0]}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900">{selectedItem.name || selectedItem.title}</h4>
                {selectedItem.verification?.isVerified && (
                  <span className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full font-bold border border-teal-200">
                    Verified ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {selectedItem.bio || selectedItem.description || selectedItem.tagline || 'Nearby in Ranchi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedItem.trustScore !== undefined && (
              <TrustScoreBadge score={selectedItem.trustScore} size="sm" />
            )}
            <a
              href={selectedItem.hourlyRate ? `/companions/${selectedItem._id}` : selectedItem.date ? `/events/${selectedItem._id}` : `/profile/${selectedItem._id}`}
              className="px-4 py-2 bg-brand-coral hover:bg-brand-coralDark text-white text-xs font-bold rounded-xl shadow transition"
            >
              View Profile
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
