import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const CreateEvent = () => {
  const navigate = useNavigate();
  const { userLocation } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'adventure',
    date: '',
    time: '10:00 AM',
    address: 'Ranchi Lake, Main Road',
    city: userLocation?.city || 'Ranchi',
    isFree: true,
    price: 0,
    maxParticipants: 20
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/events', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: new Date(formData.date),
        time: formData.time,
        isFree: formData.isFree,
        price: Number(formData.price),
        maxParticipants: Number(formData.maxParticipants),
        location: {
          type: 'Point',
          coordinates: [userLocation?.longitude || 85.3096, userLocation?.latitude || 23.3441],
          address: formData.address,
          city: formData.city
        }
      });

      if (res.data?.event) {
        navigate(`/events/${res.data.event._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-amber-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Host a Meetup or Event</h1>
              <p className="text-xs text-slate-500">Plan an activity with fellow Resonators</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Sunset Photography & Walk at Tagore Hill"
                className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-amber-500 outline-none"
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
                  className="w-full px-3 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-amber-500 outline-none"
                >
                  <option value="adventure">Adventure & Trekking</option>
                  <option value="photography">Photography Walk</option>
                  <option value="food">Food Crawl</option>
                  <option value="workshop">Workshop / Skill</option>
                  <option value="music">Music & Jam Session</option>
                  <option value="meetup">General Meetup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Participants
                </label>
                <input
                  type="number"
                  min="2"
                  max="500"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g. 05:00 PM"
                  className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meeting Address / Landmark
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Ranchi Lake Main Gate"
                className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Description & Plan
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Share itinerary, items to bring, meeting instructions..."
                className="w-full px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-2xl border border-slate-200 focus:bg-white focus:border-amber-500 outline-none"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white text-xs font-extrabold rounded-2xl shadow-amber-500/30 transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Publishing Event...' : 'Publish Event Listing'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
