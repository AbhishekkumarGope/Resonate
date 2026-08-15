import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake, Star, ShieldCheck, MapPin, Calendar, Clock,
  DollarSign, Globe, Check, ArrowLeft, MessageSquare, AlertCircle
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const CompanionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [duration, setDuration] = useState(2); // hours
  const [meetingPoint, setMeetingPoint] = useState('Ranchi Lake Entrance');
  const [purpose, setPurpose] = useState('Photography tour and local food exploration');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchCompanion = async () => {
      try {
        const res = await api.get(`/companions/${id}`);
        if (res.data?.companion) {
          setCompanion(res.data.companion);
        }
      } catch (err) {
        console.error('Failed to load companion details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanion();
  }, [id]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      alert('Please select a date for the companion booking.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/bookings', {
        companionId: id,
        date: new Date(bookingDate),
        startTime,
        duration: Number(duration),
        purpose,
        meetingPoint
      });

      if (res.data?.booking) {
        setBookingSuccess(res.data.booking);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500">Loading companion profile...</div>
      </AppLayout>
    );
  }

  if (!companion) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl p-12 text-center">
          <h2 className="text-lg font-bold text-slate-800">Companion Not Found</h2>
          <Link to="/companions" className="text-xs font-bold text-brand-coral mt-2 inline-block">Return to Directory</Link>
        </div>
      </AppLayout>
    );
  }

  const totalAmount = (companion.hourlyRate || 500) * duration;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <button
          onClick={() => navigate('/companions')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Companions</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Companion Profile */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80">
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-coral to-rose-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-coral overflow-hidden">
                    {companion.user?.profileImage ? (
                      <img src={companion.user.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      companion.user?.name?.[0] || 'C'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-extrabold text-slate-900">{companion.user?.name}</h1>
                      <span className="px-2 py-0.5 bg-teal-50 text-brand-teal border border-teal-200 rounded-full text-xs font-bold">
                        Verified Companion ✓
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 italic font-medium">"{companion.tagline}"</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{companion.rating || 4.9}</span>
                      <span className="text-slate-400 font-normal">({companion.totalReviews || 24} reviews)</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-semibold">{companion.totalBookings || 30}+ Bookings</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-extrabold text-slate-900">₹{companion.hourlyRate}</span>
                  <span className="block text-[11px] text-slate-400">/ hour</span>
                </div>
              </div>

              {/* Trust Score Card */}
              <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <TrustScoreBadge score={companion.user?.trustScore || 92} showDetails={true} />
              </div>

              {/* About & Specialties */}
              <div className="space-y-4 text-xs text-slate-700">
                <div>
                  <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-1">About Me</h3>
                  <p className="leading-relaxed">{companion.about || companion.user?.bio}</p>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {companion.specialties?.map((spec, i) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl font-bold capitalize">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2">Languages Spoken</h3>
                  <div className="flex flex-wrap gap-2">
                    {(companion.languages || ['Hindi', 'English']).map((lang, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Workflow Card */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 sticky top-20">
              <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Book This Companion</span>
                <span className="text-xs font-bold text-brand-coral">₹{companion.hourlyRate}/hr</span>
              </h3>

              {!bookingSuccess ? (
                <form onSubmit={handleCreateBooking} className="space-y-4 mt-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Date of Session
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-coral outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="text"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-coral outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Duration (Hours)
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-coral outline-none font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map(h => (
                          <option key={h} value={h}>{h} Hours</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Meeting Point / Area
                    </label>
                    <input
                      type="text"
                      required
                      value={meetingPoint}
                      onChange={(e) => setMeetingPoint(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-coral outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Purpose / Activity Plan
                    </label>
                    <textarea
                      rows={2}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-coral outline-none"
                    />
                  </div>

                  {/* Price Calculation Box */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Rate:</span>
                      <span>₹{companion.hourlyRate} × {duration} hrs</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Safety & Platform Fee:</span>
                      <span className="text-emerald-600 font-semibold">Waived (₹0)</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                      <span>Total Amount:</span>
                      <span className="text-brand-coral font-black">₹{totalAmount}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3 bg-brand-coral hover:bg-brand-coralDark active:scale-98 text-white font-extrabold rounded-2xl shadow-coral transition"
                  >
                    {bookingLoading ? 'Submitting Booking Request...' : 'Confirm & Request Companion'}
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    Payment is captured only after companion confirmation. GPS tracking is active throughout session.
                  </p>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">Booking Request Sent!</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    Your request for <strong>{duration} hours (₹{totalAmount})</strong> has been sent to {companion.user?.name}.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      to="/bookings"
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                    >
                      View in My Bookings
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
