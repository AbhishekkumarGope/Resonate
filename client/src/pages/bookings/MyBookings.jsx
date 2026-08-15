import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import api from '../../services/api';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('sent'); // 'sent' or 'received'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/bookings?type=${tab}`);
        if (res.data?.bookings) {
          setBookings(res.data.bookings);
        }
      } catch (err) {
        console.error('Failed to load bookings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [tab]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      completed: 'bg-sky-50 text-sky-700 border-sky-200',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
      rejected: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${map[status] || 'bg-slate-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Bookings & Sessions</h1>
            <p className="text-xs text-slate-500">Track and manage your hired companion appointments</p>
          </div>

          <div className="flex items-center p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setTab('sent')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                tab === 'sent' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Companions I Hired
            </button>
            <button
              onClick={() => setTab('received')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                tab === 'received' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Requests For Me
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="flex flex-col gap-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => {
              const otherUser = tab === 'sent' ? booking.companionUser : booking.user;

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 font-bold text-base flex items-center justify-center border">
                      {otherUser?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{otherUser?.name || 'Companion'}</h3>
                        {getStatusBadge(booking.status)}
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Purpose: <strong className="text-slate-700">{booking.purpose || 'Exploration'}</strong>
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {booking.startTime} ({booking.duration} hrs)
                        </span>
                        <span className="font-bold text-brand-coral">₹{booking.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions depending on role */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    {tab === 'received' && booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(booking._id, 'confirmed')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(booking._id, 'rejected')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(booking._id, 'completed')}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl"
                      >
                        Mark Completed
                      </button>
                    )}

                    <Link
                      to="/messages"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                      title="Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 shadow-card border border-slate-200/80">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No Bookings Found</h3>
              <p className="text-xs text-slate-400 mt-1">Explore verified companions to book your first outing.</p>
              <Link
                to="/companions"
                className="mt-4 inline-block px-4 py-2 bg-brand-coral text-white text-xs font-bold rounded-xl shadow-coral"
              >
                Browse Companions
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
