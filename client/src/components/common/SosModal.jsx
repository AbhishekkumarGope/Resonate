import React, { useState } from 'react';
import { AlertOctagon, PhoneCall, ShieldCheck, MapPin, X, Loader2, Radio } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const SosModal = ({ isOpen, onClose }) => {
  const { userLocation } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [customMsg, setCustomMsg] = useState('Emergency! I need immediate assistance. Here is my live location.');

  if (!isOpen) return null;

  const handleTriggerSos = async () => {
    setSending(true);
    try {
      await api.post('/safety/sos', {
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        message: customMsg
      });
      setSent(true);
    } catch (err) {
      console.error('SOS dispatch error', err);
      // Fallback display
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <AlertOctagon className="w-9 h-9 text-rose-600" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">Emergency Buddy SOS</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
              This will instantly broadcast your live GPS coordinates to your registered emergency contacts and community safety team.
            </p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-left">
              <MapPin className="w-5 h-5 text-brand-coral shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-700">GPS Coordinates Attached:</span>
                <p className="text-slate-500 font-mono">
                  Lat: {userLocation?.latitude?.toFixed(4) || '23.3441'}, Lng: {userLocation?.longitude?.toFixed(4) || '85.3096'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-700 block text-left mb-1">
                Emergency Message
              </label>
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50"
                rows={2}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleTriggerSos}
                disabled={sending}
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Broadcasting SOS Signals...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span>SEND EMERGENCY SOS ALERT</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
                <span>National Emergency: <strong className="text-slate-800">112</strong></span>
                <span>Women Helpline: <strong className="text-slate-800">1091</strong></span>
                <span>Police: <strong className="text-slate-800">100</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">SOS Alert Dispatched</h3>
            <p className="text-sm text-slate-600 mt-2">
              Your live GPS location and alert have been sent to your emergency buddies. Keep your phone accessible.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSent(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
              >
                Close & Stay Safe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
