import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const CreateListing = () => {
  const navigate = useNavigate();
  const { userLocation } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'camping',
    type: 'rent',
    price: 300,
    priceUnit: 'per-day',
    condition: 'good',
    city: userLocation?.city || 'Ranchi'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/marketplace', {
        ...formData,
        price: Number(formData.price),
        location: {
          type: 'Point',
          coordinates: [userLocation?.longitude || 85.3096, userLocation?.latitude || 23.3441],
          city: formData.city
        }
      });
      navigate('/marketplace');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-sky-600/30">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">List an Item or Gear</h1>
              <p className="text-xs text-slate-500">Rent, sell or share equipment with local community</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 4-Person Waterproof Camping Tent"
                className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Listing Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-none"
                >
                  <option value="rent">For Rent</option>
                  <option value="sell">For Sale</option>
                  <option value="share">Free Share / Community Borrow</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-none"
                >
                  <option value="camping">Camping & Outdoor</option>
                  <option value="photography">Photography & Camera</option>
                  <option value="sports">Sports & Cycling</option>
                  <option value="electronics">Electronics & Audio</option>
                  <option value="tools">Tools & Hardware</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Price (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Price Unit
                </label>
                <select
                  value={formData.priceUnit}
                  onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-none"
                >
                  <option value="per-day">Per Day</option>
                  <option value="per-hour">Per Hour</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="free">Free</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Description & Condition
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Include specs, what accessories are included, pickup location..."
                className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-extrabold rounded-2xl shadow-sky-600/30 transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Publishing...' : 'Publish Listing'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
