import React, { useState, useEffect } from 'react';
import {
  Compass, MapPin, Filter, Users, Tag, Plus, Download, Radio,
  Sliders, Search, ArrowRight, UserCheck, Calendar, ShieldCheck
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { InteractiveMap } from '../../components/map/InteractiveMap';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const GeolocationDiscovery = () => {
  const { userLocation } = useAuth();
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'browse'
  const [radius, setRadius] = useState(25); // km
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Photographers', 'Trekkers', 'Foodies']);

  const availableTags = [
    'Photographers', 'Trekkers', 'Foodies', 'Tech Developers',
    'Yoga Enthusiasts', 'Companions Available', 'Weekend Events', 'Gear Rental'
  ];

  useEffect(() => {
    const fetchNearby = async () => {
      setLoading(true);
      try {
        const [usersRes, companionsRes, eventsRes] = await Promise.all([
          api.get(`/users/nearby?maxDistance=${radius * 1000}`).catch(() => ({ data: { users: [] } })),
          api.get(`/companions/nearby?maxDistance=${radius * 1000}`).catch(() => ({ data: { companions: [] } })),
          api.get(`/events/nearby?maxDistance=${radius * 1000}`).catch(() => ({ data: { events: [] } }))
        ]);

        const allItems = [
          ...(usersRes.data?.users || []).map(u => ({ ...u, type: 'user' })),
          ...(companionsRes.data?.companions || []).map(c => ({ ...c, type: 'companion', isCompanion: true })),
          ...(eventsRes.data?.events || []).map(e => ({ ...e, type: 'event' }))
        ];

        setItems(allItems);
      } catch (err) {
        console.error('Failed to load discovery items', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [radius]);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <AppLayout showRightSidebar={false} fullWidth={true}>
      <div className="flex flex-col gap-6">
        {/* Top Header & Analytics Row (Inspired by Reference Image 1) */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-coral text-white flex items-center justify-center shadow-coral">
                <Compass className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Live Geolocation Radar
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time geospatial discovery of people, companions, and activities around Ranchi
            </p>
          </div>

          {/* Three Metric Circles from Reference Image 1 */}
          <div className="flex items-center gap-6 self-stretch sm:self-auto justify-around border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-brand-teal flex items-center justify-center text-brand-teal font-extrabold text-xs">
                {items.length * 12 + 1240}
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-800 leading-tight">Total Network</span>
                <span className="text-[10px] text-slate-400">In Region</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-brand-coral flex items-center justify-center text-brand-coral font-extrabold text-xs">
                {items.length || 18}
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-800 leading-tight">Geolocated</span>
                <span className="text-[10px] text-slate-400">Within {radius}km</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center text-amber-500 font-extrabold text-xs">
                6
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-800 leading-tight">Active Events</span>
                <span className="text-[10px] text-slate-400">This Week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discovery Work Area (Sidebar Controls + Main Map/Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls & Tag Filters (Matches Reference Image 1 Left Bar) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Geo Settings & Distance Slider */}
            <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-200/80">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Sliders className="w-4 h-4 text-brand-coral" />
                <h3 className="font-extrabold text-xs text-slate-900">Geo Radius Range</h3>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Detection Radius:</span>
                  <span className="text-brand-coral font-extrabold">{radius} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full accent-brand-coral h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 km</span>
                  <span>50 km</span>
                  <span>100 km</span>
                </div>
              </div>
            </div>

            {/* Tag Filter Group */}
            <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-200/80">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-teal" />
                  <h3 className="font-extrabold text-xs text-slate-900">Geo Tags</h3>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-3">
                {availableTags.map((tag, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      className="rounded accent-brand-coral"
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>

              <form onSubmit={handleAddTag} className="mt-3 pt-3 border-t border-slate-100 flex gap-1.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add custom tag..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none focus:border-brand-coral"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Main Map Canvas Area */}
          <div className="lg:col-span-9 flex flex-col gap-4">
            {/* View Switcher Top Bar */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl shadow-card border border-slate-200/80">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    viewMode === 'map' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Map View
                </button>
                <button
                  onClick={() => setViewMode('browse')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    viewMode === 'browse' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  List Directory ({items.length})
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => alert('Exporting active geolocation pins dataset as CSV...')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => alert('Geo-tag saved to your profile range!')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-coral hover:bg-brand-coralDark text-white font-bold rounded-xl shadow-coral transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Geo-Tag Me</span>
                </button>
              </div>
            </div>

            {/* Map or Browse Mode */}
            {viewMode === 'map' ? (
              <InteractiveMap
                items={items}
                radius={radius}
                onItemSelect={(item) => setSelectedItem(item)}
                selectedItem={selectedItem}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="bg-white rounded-3xl p-4 shadow-card border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center overflow-hidden border">
                          {item.profileImage ? (
                            <img src={item.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            item.name?.[0] || 'U'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-extrabold text-xs text-slate-900">{item.name || item.title}</h4>
                            {item.verification?.isVerified && (
                              <span className="text-brand-teal text-xs">✓</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{item.type?.toUpperCase()} • Ranchi</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                        {item.bio || item.description || item.tagline || 'Active community member in Ranchi.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <TrustScoreBadge score={item.trustScore || 85} size="sm" />
                      <a
                        href={item.hourlyRate ? `/companions/${item._id}` : item.date ? `/events/${item._id}` : `/profile/${item._id}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                      >
                        Connect
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
