import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake, Star, ShieldCheck, MapPin, Search, Filter,
  DollarSign, Globe, Check, ArrowRight
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import api from '../../services/api';

export const CompanionsList = () => {
  const [companions, setCompanions] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const specialtyFilters = [
    { id: '', label: 'All Specialties' },
    { id: 'adventure', label: 'Adventure & Treks' },
    { id: 'photography', label: 'Photography' },
    { id: 'cultural', label: 'Cultural Guide' },
    { id: 'food', label: 'Food & Nightlife' },
    { id: 'fitness', label: 'Fitness Buddy' },
  ];

  useEffect(() => {
    const fetchCompanions = async () => {
      setLoading(true);
      try {
        const query = specialty ? `?specialty=${specialty}` : '';
        const res = await api.get(`/companions${query}`);
        if (res.data?.companions) {
          setCompanions(res.data.companions);
        }
      } catch (err) {
        console.error('Failed to load companions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanions();
  }, [specialty]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header Banner (Inspired by Reference Image 3 Hero design) */}
        <div className="bg-gradient-to-r from-brand-coral via-rose-500 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold mb-2">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>COMPANION BOOKING HUB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hire Verified Companions For Local Activities
            </h1>
            <p className="text-xs text-rose-100 mt-1 max-w-lg leading-relaxed">
              Explore city attractions, photography tours, hiking trails, and food crawl sessions with background-verified companions.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs text-center shrink-0">
            <span className="block font-bold text-white text-lg">₹400 – ₹800</span>
            <span className="text-[11px] text-rose-200">Average Hourly Rate</span>
            <span className="block mt-1 text-[10px] text-emerald-300 font-bold">100% ID Verified</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {specialtyFilters.map((s) => (
            <button
              key={s.id}
              onClick={() => setSpecialty(s.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                specialty === s.id
                  ? 'bg-brand-coral text-white shadow-coral'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Companions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companions.map((comp) => {
            const userName = comp.user?.name || 'Verified Companion';
            const rate = comp.hourlyRate || 500;

            return (
              <div
                key={comp._id}
                className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col justify-between hover:shadow-xl hover:border-brand-coral/40 transition group"
              >
                <div>
                  {/* Top user profile header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-coral to-rose-400 text-white font-bold text-base flex items-center justify-center shadow-coral overflow-hidden">
                        {comp.user?.profileImage ? (
                          <img src={comp.user.profileImage} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                          userName[0]
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-brand-coral transition">
                            {userName}
                          </h3>
                          <span className="text-brand-teal text-xs" title="Verified">✓</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{comp.rating || 4.8}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({comp.totalReviews || 18} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-brand-coral/10 text-brand-coral font-extrabold text-xs rounded-xl">
                      ₹{rate}/hr
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold mt-3 italic">
                    "{comp.tagline || 'Ready to explore together!'}"
                  </p>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {comp.about || comp.user?.bio || 'Certified companion passionate about adventures.'}
                  </p>

                  {/* Badges / Specialties */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {comp.specialties?.map((spec, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg capitalize">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <TrustScoreBadge score={comp.user?.trustScore || 88} showDetails={false} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-coral" />
                    <span>{comp.location?.city || 'Ranchi, JH'}</span>
                  </div>

                  <Link
                    to={`/companions/${comp._id}`}
                    className="px-4 py-2 bg-slate-900 group-hover:bg-brand-coral text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <span>Book Companion</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};
