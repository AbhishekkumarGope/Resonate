import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Star, ShieldCheck, Flame, ArrowRight, ExternalLink } from 'lucide-react';
import { TrustScoreBadge } from '../common/TrustScoreBadge';

export const RightSidebar = () => {
  const suggestedPeople = [
    { name: 'Priya Patel', role: 'Art & Yoga Guide', trust: 92, avatar: '', id: 'demo-priya', verified: true },
    { name: 'Vikram Singh', role: 'Trekking & Fitness Coach', trust: 88, avatar: '', id: 'demo-vikram', verified: true },
    { name: 'Sneha Gupta', role: 'Food & Culture Blogger', trust: 81, avatar: '', id: 'demo-sneha', verified: true },
  ];

  const trendingTopics = [
    { tag: '#RanchiPhotoWalk', posts: '124 posts' },
    { tag: '#HundruFallsTrek', posts: '89 posts' },
    { tag: '#ReactMeetupJharkhand', posts: '67 posts' },
    { tag: '#NightlifeRanchi', posts: '45 posts' },
  ];

  return (
    <aside className="w-72 shrink-0 hidden xl:block">
      <div className="sticky top-20 flex flex-col gap-4">
        {/* Who to connect with (Inspired by Reference Image 2) */}
        <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-200/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-xs tracking-tight">Verified Nearby Resonators</h3>
            <Link to="/discovery" className="text-[11px] font-bold text-brand-coral hover:underline">
              View Map
            </Link>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            {suggestedPeople.map((person, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-2xl hover:bg-slate-50 transition">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-teal to-sky-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {person.name[0]}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-slate-800 truncate">{person.name}</span>
                      {person.verified && <span className="text-[10px] text-brand-teal">✓</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{person.role}</p>
                  </div>
                </div>

                <Link
                  to="/companions"
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-brand-coral hover:text-white text-slate-600 transition"
                  title="Connect"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Tags */}
        <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-200/80">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Flame className="w-4 h-4 text-brand-coral" />
            <h3 className="font-extrabold text-slate-900 text-xs">Trending in Ranchi</h3>
          </div>

          <div className="flex flex-col gap-2.5 mt-3">
            {trendingTopics.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs group cursor-pointer">
                <div>
                  <span className="font-bold text-slate-700 group-hover:text-brand-coral transition">
                    {item.tag}
                  </span>
                  <span className="block text-[10px] text-slate-400">{item.posts}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-coral group-hover:translate-x-0.5 transition" />
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Trust Assurance Badge */}
        <div className="bg-emerald-50/60 rounded-3xl p-4 border border-emerald-200/60 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Community Trust Guarantee</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
            All companions are ID-verified with phone and rating checks. GPS tracking is active during all companion bookings.
          </p>
          <Link to="/safety" className="inline-block mt-2 font-bold text-emerald-800 hover:underline text-[11px]">
            Safety Standards & SOS Guide →
          </Link>
        </div>
      </div>
    </aside>
  );
};
