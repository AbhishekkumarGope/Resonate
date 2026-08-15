import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, MapPin, Tag, Search, Filter, ArrowRight } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import api from '../../services/api';

export const MarketplaceList = () => {
  const [items, setItems] = useState([]);
  const [type, setType] = useState('all'); // sell, rent, share, all
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const query = type !== 'all' ? `?type=${type}&search=${search}` : `?search=${search}`;
        const res = await api.get(`/marketplace${query}`);
        if (res.data?.items) {
          setItems(res.data.items);
        }
      } catch (err) {
        console.error('Failed to load marketplace items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [type, search]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-sky-500 via-indigo-600 to-slate-900 rounded-3xl p-6 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>GEAR & ITEM EXCHANGE</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Rent, Share & Buy Local Adventure Gear
            </h1>
            <p className="text-xs text-sky-100 mt-1 max-w-md">
              Borrow camping gear, cameras, and bikes directly from verified community members in Ranchi.
            </p>
          </div>

          <Link
            to="/marketplace/create"
            className="px-5 py-2.5 bg-white text-sky-600 hover:bg-sky-50 text-xs font-extrabold rounded-2xl shadow transition self-start sm:self-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>List An Item</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cameras, tents, bikes, lenses..."
              className="w-full pl-10 pr-4 py-2.5 bg-white text-xs font-medium rounded-2xl border border-slate-200 shadow-sm focus:border-sky-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'rent', label: 'For Rent' },
              { id: 'sell', label: 'For Sale' },
              { id: 'share', label: 'Free Share' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  type === t.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col justify-between hover:shadow-xl hover:border-sky-200 transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    item.type === 'rent'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : item.type === 'share'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}>
                    {item.type}
                  </span>

                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 text-base">
                      {item.price === 0 ? 'FREE' : `₹${item.price}`}
                    </span>
                    {item.priceUnit && item.priceUnit !== 'fixed' && item.priceUnit !== 'free' && (
                      <span className="text-[10px] text-slate-400 block -mt-1">
                        /{item.priceUnit.replace('per-', '')}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 mt-3 group-hover:text-sky-600 transition">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.description || 'Quality gear available in Ranchi.'}
                </p>

                <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
                  <span className="capitalize font-semibold text-slate-700">{item.category}</span>
                  <span>•</span>
                  <span>Condition: <strong className="text-slate-700 capitalize">{item.condition}</strong></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px]">
                    {item.seller?.name?.[0] || 'S'}
                  </div>
                  <span className="truncate max-w-[100px]">{item.seller?.name || 'Seller'}</span>
                </div>

                <button
                  onClick={() => alert(`Connecting with ${item.seller?.name || 'seller'} regarding ${item.title}`)}
                  className="px-3.5 py-1.5 bg-slate-900 group-hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};
