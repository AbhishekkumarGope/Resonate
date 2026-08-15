import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, MapPin, Search, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import api from '../../services/api';

export const CommunitiesList = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'All Communities' },
    { id: 'photography', label: 'Photography' },
    { id: 'nature', label: 'Trekking & Nature' },
    { id: 'food', label: 'Food & Cooking' },
    { id: 'tech', label: 'Tech & Code' },
    { id: 'music', label: 'Music & Jam' },
    { id: 'sports', label: 'Sports & Fitness' },
  ];

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/communities?category=${selectedCategory}&search=${search}`);
        if (res.data?.communities) {
          setCommunities(res.data.communities);
        }
      } catch (err) {
        console.error('Failed to load communities', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, [selectedCategory, search]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-teal via-teal-600 to-slate-900 rounded-3xl p-6 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>COMMUNITY DIRECTORY</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Connect With Local Tribal & Urban Hubs
            </h1>
            <p className="text-xs text-teal-100 mt-1 max-w-md">
              Join active interest groups, plan joint outings, and collaborate with verified members.
            </p>
          </div>

          <Link
            to="/community/create"
            className="px-5 py-2.5 bg-white text-brand-teal hover:bg-teal-50 text-xs font-extrabold rounded-2xl shadow transition self-start sm:self-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Community</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groups by name or topic..."
              className="w-full pl-10 pr-4 py-2.5 bg-white text-xs font-medium rounded-2xl border border-slate-200 shadow-sm focus:border-brand-teal outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-brand-teal text-white shadow-teal'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map((comm) => (
            <div
              key={comm._id}
              className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col justify-between hover:shadow-lg hover:border-teal-200 transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-teal to-sky-400 text-white font-extrabold text-base flex items-center justify-center shadow-teal">
                      {comm.name[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-brand-teal transition">
                        {comm.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="capitalize font-semibold text-brand-teal">{comm.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {comm.memberCount || 4} Members
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {comm.description || 'A vibrant community on Let\'s Resonate.'}
                </p>

                {comm.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {comm.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-brand-coral" />
                  <span>{comm.location?.city || 'Ranchi, Jharkhand'}</span>
                </div>

                <Link
                  to={`/community/${comm._id}`}
                  className="px-4 py-2 bg-slate-900 group-hover:bg-brand-teal text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>Explore Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};
