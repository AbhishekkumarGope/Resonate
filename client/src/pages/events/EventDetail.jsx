import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle, Share2, ShieldCheck, Plus } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        if (res.data?.event) {
          setEvent(res.data.event);
          const isGoing = res.data.event.participants?.some(p => p.user?._id === user?._id || p.user === user?._id);
          setJoined(isGoing);
        }
      } catch (err) {
        console.error('Failed to load event', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user]);

  const handleJoinToggle = async () => {
    try {
      if (joined) {
        await api.delete(`/events/${id}/leave`);
        setJoined(false);
        setEvent(prev => ({ ...prev, participantCount: Math.max(0, prev.participantCount - 1) }));
      } else {
        await api.post(`/events/${id}/join`);
        setJoined(true);
        setEvent(prev => ({ ...prev, participantCount: prev.participantCount + 1 }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500">Loading event details...</div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl p-12 text-center">
          <h2 className="text-lg font-bold text-slate-800">Event Not Found</h2>
          <Link to="/events" className="text-xs font-bold text-brand-coral mt-2 inline-block">Return to Events</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </button>

        {/* Main Event Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 overflow-hidden relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-extrabold uppercase">
                  {event.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  event.isFree ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {event.isFree ? 'FREE ENTRY' : `₹${event.price}`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{event.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleJoinToggle}
                className={`px-6 py-3 rounded-2xl text-xs font-extrabold shadow transition flex items-center gap-2 ${
                  joined
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                }`}
              >
                {joined ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>RSVP Confirmed (Leave)</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Join This Event</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Event Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Date</span>
                <span className="text-xs font-bold text-slate-800">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Time</span>
                <span className="text-xs font-bold text-slate-800">{event.time || '10:00 AM'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Meeting Point</span>
                <span className="text-xs font-bold text-slate-800">{event.location?.address || event.location?.city || 'Ranchi'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Event Details</h3>
            <p className="text-xs text-slate-700 leading-relaxed max-w-3xl whitespace-pre-line">
              {event.description || 'Join this exciting community meetup in Ranchi.'}
            </p>
          </div>

          {/* Organizer Card */}
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-200 font-bold text-slate-700 flex items-center justify-center overflow-hidden">
                {event.organizer?.profileImage ? (
                  <img src={event.organizer.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  event.organizer?.name?.[0] || 'O'
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Organized By</span>
                <h4 className="text-xs font-extrabold text-slate-900">{event.organizer?.name || 'Community Member'}</h4>
              </div>
            </div>

            <Link
              to={`/profile/${event.organizer?._id}`}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
            >
              Organizer Profile
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
