import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, MapPin, Calendar, Plus, MessageSquare, ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await api.get(`/communities/${id}`);
        if (res.data?.community) {
          setCommunity(res.data.community);
          const isMember = res.data.community.members?.some(m => m.user?._id === user?._id || m.user === user?._id);
          setJoined(isMember);
        }
      } catch (err) {
        console.error('Failed to load community detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunity();
  }, [id, user]);

  const handleJoin = async () => {
    try {
      if (joined) {
        await api.delete(`/communities/${id}/leave`);
        setJoined(false);
      } else {
        await api.post(`/communities/${id}/join`);
        setJoined(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating membership');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500">Loading community...</div>
      </AppLayout>
    );
  }

  if (!community) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl p-12 text-center">
          <h2 className="text-lg font-bold text-slate-800">Community Not Found</h2>
          <Link to="/community" className="text-xs font-bold text-brand-coral mt-2 inline-block">Return to Directory</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Communities</span>
        </button>

        {/* Community Header Banner */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 overflow-hidden relative">
          <div className="h-28 -mx-6 -mt-6 bg-gradient-to-r from-brand-teal via-teal-600 to-slate-900" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-10">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-3xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-2xl bg-brand-teal text-white font-extrabold text-2xl flex items-center justify-center">
                  {community.name[0]}
                </div>
              </div>
              <div className="mb-1">
                <h1 className="text-2xl font-extrabold text-slate-900">{community.name}</h1>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="capitalize font-bold text-brand-teal">{community.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {community.memberCount || community.members?.length || 1} Members
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-coral" />
                    {community.location?.city || 'Ranchi'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={handleJoin}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow transition flex items-center justify-center gap-1.5 ${
                  joined
                    ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    : 'bg-brand-teal hover:bg-teal-600 text-white shadow-teal'
                }`}
              >
                {joined ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Member (Leave)</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Join Community</span>
                  </>
                )}
              </button>

              <Link
                to="/messages"
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow transition"
                title="Community Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">About Group</h3>
            <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
              {community.description || 'Welcome to this group! Connect with local enthusiasts.'}
            </p>
          </div>
        </div>

        {/* Community Members List */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center justify-between">
            <span>Members in this Community</span>
            <span className="text-xs text-brand-teal font-bold">{community.members?.length || 0} Registered</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {community.members?.map((m, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                  {m.user?.name?.[0] || 'U'}
                </div>
                <div className="overflow-hidden">
                  <span className="block font-bold text-xs text-slate-800 truncate">{m.user?.name || 'Community Member'}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{m.role || 'Member'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
