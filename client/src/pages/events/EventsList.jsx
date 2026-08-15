import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Plus, Clock, Users, Tag, Search, ArrowRight } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import api from '../../services/api';

export const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/events?category=${category}&search=${search}`);
        if (res.data?.events) {
          setEvents(res.data.events);
        }
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [category, search]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-slate-900 rounded-3xl p-6 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>EVENTS & ACTIVITIES</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Nearby Treks, Workshops & Meetups
            </h1>
            <p className="text-xs text-amber-100 mt-1 max-w-md">
              Discover verified local events in Ranchi and surrounding areas.
            </p>
          </div>

          <Link
            to="/events/create"
            className="px-5 py-2.5 bg-white text-amber-600 hover:bg-amber-50 text-xs font-extrabold rounded-2xl shadow transition self-start sm:self-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Host An Event</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by title or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-white text-xs font-medium rounded-2xl border border-slate-200 shadow-sm focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['all', 'photography', 'adventure', 'food', 'workshop', 'music'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                  category === cat
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Events' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => {
            const eventDate = ev.date ? new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) : 'Upcoming';

            return (
              <div
                key={ev._id}
                className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col justify-between hover:shadow-lg hover:border-amber-200 transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-600 font-extrabold shrink-0 shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Date</span>
                        <span className="text-sm leading-none mt-0.5">{eventDate.split(',')[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition">
                          {ev.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Clock className="w-3 h-3" />
                            {ev.time || '10:00 AM'}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{ev.category}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      ev.isFree ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {ev.isFree ? 'FREE' : `₹${ev.price}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {ev.description || 'Join this exciting community meetup.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-3.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-coral" />
                      <span>{ev.location?.address || ev.location?.city || 'Ranchi'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.participantCount || 1} / {ev.maxParticipants || 30} Going</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Host: {ev.organizer?.name || 'Local Community'}
                  </span>
                  <Link
                    to={`/events/${ev._id}`}
                    className="px-4 py-2 bg-slate-900 group-hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <span>View & Join</span>
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
