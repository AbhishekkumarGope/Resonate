import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MapPin, Tag, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const CreateCommunity = () => {
  const navigate = useNavigate();
  const { userLocation } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'photography',
    city: userLocation?.city || 'Ranchi',
    tags: 'photography, weekend, creative'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.post('/communities', {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: tagsArray,
        location: {
          type: 'Point',
          coordinates: [userLocation?.longitude || 85.3096, userLocation?.latitude || 23.3441],
          city: formData.city
        }
      });

      if (res.data?.community) {
        navigate(`/community/${res.data.community._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-teal">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Create a New Community</h1>
              <p className="text-xs text-slate-500">Bring together passionate locals in Jharkhand</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Community Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ranchi Sunset Photographers"
                className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-brand-teal outline-none"
                >
                  <option value="photography">Photography</option>
                  <option value="nature">Trekking & Nature</option>
                  <option value="food">Food & Culinary</option>
                  <option value="tech">Technology & Code</option>
                  <option value="music">Music & Performance</option>
                  <option value="sports">Sports & Fitness</option>
                  <option value="art">Art & Design</option>
                  <option value="travel">Travel & Exploration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-brand-teal outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Purpose
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your community does, upcoming plans, and who should join..."
                className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g. photography, nature, weekend"
                className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-brand-teal hover:bg-teal-600 active:scale-98 text-white text-xs font-extrabold rounded-2xl shadow-teal transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Hub...' : 'Launch Community Hub'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
