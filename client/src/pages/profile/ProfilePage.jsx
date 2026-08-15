import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, ShieldCheck, Calendar, HeartHandshake,
  MessageSquare, UserPlus, Star, Edit3
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMyProfile = !id || id === currentUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      const targetId = id || currentUser?._id;
      if (!targetId) return;

      try {
        const res = await api.get(`/users/${targetId}`);
        if (res.data?.user) {
          setProfile(res.data.user);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser]);

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500">Loading profile...</div>
      </AppLayout>
    );
  }

  const user = profile || currentUser;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 overflow-hidden relative">
          <div className="h-32 -mx-8 -mt-8 bg-gradient-to-r from-brand-coral via-rose-500 to-brand-teal" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 pb-6 border-b border-slate-100">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-2xl bg-brand-coral text-white font-extrabold text-3xl flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0] || 'U'
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
                  {user.verification?.isVerified && (
                    <span className="px-2 py-0.5 bg-teal-50 text-brand-teal border border-teal-200 rounded-full text-xs font-bold">
                      Verified ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-coral" />
                  <span>{user.location?.city || 'Ranchi, Jharkhand'}</span>
                  <span>•</span>
                  <span className="capitalize font-bold text-slate-700">Role: {user.role}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isMyProfile ? (
                <>
                  <button
                    onClick={() => alert(`Friend request sent to ${user.name}`)}
                    className="px-4 py-2 bg-brand-coral hover:bg-brand-coralDark text-white text-xs font-bold rounded-xl shadow-coral transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Friend</span>
                  </button>
                  <Link
                    to="/messages"
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => alert('Profile update modal')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">About & Bio</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {user.bio || 'Exploring Ranchi with fellow Resonators!'}
              </p>

              <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mt-4 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-1.5">
                {(user.interests || ['photography', 'trekking', 'technology']).map((int, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl capitalize">
                    {int}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Trust Metrics</h3>
              <TrustScoreBadge score={user.trustScore || 85} showDetails={true} />

              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Gender:</span>
                  <span className="font-bold text-slate-800 capitalize">{user.gender || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Availability:</span>
                  <span className="font-bold text-emerald-600 capitalize">{user.availability || 'Available'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
