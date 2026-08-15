import React, { useState, useEffect } from 'react';
import {
  Shield, ShieldCheck, AlertOctagon, Phone, Plus, Trash2,
  Radio, CheckCircle2, MapPin, UserPlus
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { TrustScoreBadge } from '../../components/common/TrustScoreBadge';
import { SosModal } from '../../components/common/SosModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const SafetyHub = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [trustScoreData, setTrustScoreData] = useState(null);
  const [showSosModal, setShowSosModal] = useState(false);

  // New Contact Form
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSafetyData = async () => {
      if (!user?._id) return;
      try {
        const [contactsRes, trustRes] = await Promise.all([
          api.get('/safety/emergency').catch(() => ({ data: { contacts: [] } })),
          api.get(`/safety/trust-score/${user._id}`).catch(() => ({ data: { trustScore: user.trustScore || 85 } }))
        ]);

        if (contactsRes.data?.contacts) setContacts(contactsRes.data.contacts);
        if (trustRes.data) setTrustScoreData(trustRes.data);
      } catch (err) {
        console.error('Failed to load safety data', err);
      }
    };
    fetchSafetyData();
  }, [user?._id]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    setLoading(true);
    try {
      const res = await api.post('/safety/emergency', {
        name: contactName,
        phone: contactPhone,
        relationship
      });
      if (res.data?.contact) {
        setContacts([...contacts, res.data.contact]);
        setContactName('');
        setContactPhone('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await api.delete(`/safety/emergency/${id}`);
      setContacts(contacts.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Top Emergency SOS Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-brand-coral to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>EMERGENCY BUDDY SYSTEM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Safety & Trust Command Center
            </h1>
            <p className="text-xs text-rose-100 mt-1 max-w-lg leading-relaxed">
              Configure your trusted emergency contacts for 1-tap SOS broadcasting and review your Trust Score calculation.
            </p>
          </div>

          <button
            onClick={() => setShowSosModal(true)}
            className="px-6 py-3.5 bg-white text-rose-600 hover:bg-rose-50 text-xs font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
            <span>TRIGGER EMERGENCY SOS</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Trust Score Breakdown Column */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-teal" />
                  <h3 className="font-extrabold text-sm text-slate-900">Your Trust Score Breakdown</h3>
                </div>
                <span className="text-xl font-black text-brand-teal">
                  {trustScoreData?.trustScore || user?.trustScore || 85}/100
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">Identity Verification (+20 pts)</span>
                  <span className="font-bold text-emerald-600">
                    {user?.verification?.isVerified ? '+20 ✓' : '0 (Pending)'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">Completed Bookings (+20 pts)</span>
                  <span className="font-bold text-emerald-600">+16 pts</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">Community Ratings (+15 pts)</span>
                  <span className="font-bold text-emerald-600">+15 pts (4.9★ avg)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">Event Participation (+10 pts)</span>
                  <span className="font-bold text-emerald-600">+8 pts</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">Profile Completeness & Bio (+5 pts)</span>
                  <span className="font-bold text-emerald-600">+5 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Manager Column */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80">
              <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Emergency Contacts ({contacts.length}/5)</span>
                <span className="text-[11px] text-slate-400 font-medium">Auto-notified on SOS</span>
              </h3>

              {/* Add contact form */}
              <form onSubmit={handleAddContact} className="mt-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-coral outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone (+91...)"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-coral outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-coral outline-none"
                  >
                    <option value="parent">Parent</option>
                    <option value="spouse">Spouse</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>

                  <button
                    type="submit"
                    disabled={loading || contacts.length >= 5}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl shadow transition flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Contacts List */}
              <div className="flex flex-col gap-2.5 mt-5 pt-4 border-t border-slate-100">
                {contacts.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 block">{c.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{c.phone} ({c.relationship})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteContact(c._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {contacts.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-4">
                    No emergency contacts added yet. Please add at least 1 contact.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SosModal isOpen={showSosModal} onClose={() => setShowSosModal(false)} />
    </AppLayout>
  );
};
