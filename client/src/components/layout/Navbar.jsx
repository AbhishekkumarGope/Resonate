import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, MessageSquare, Settings, User, LogOut, Shield,
  MapPin, Compass, Users, Calendar, ShoppingBag, ShieldAlert,
  Flame, HelpCircle, FileText, Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SosModal } from '../common/SosModal';

export const Navbar = () => {
  const { user, logout, isAdmin, userLocation } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/community?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Top Mini Category Bar (Inspired directly by Reference Image 1) */}
        <div className="hidden md:flex items-center justify-between px-6 py-1 bg-slate-900 text-white text-xs border-b border-slate-800">
          <div className="flex items-center gap-6">
            <Link to="/discovery" className="flex items-center gap-1.5 text-brand-coral hover:text-white font-bold transition">
              <Compass className="w-3.5 h-3.5" />
              <span>Geolocation Hub</span>
            </Link>
            <Link to="/events" className="flex items-center gap-1.5 text-amber-400 hover:text-white font-medium transition">
              <Calendar className="w-3.5 h-3.5" />
              <span>Events & Meetups</span>
            </Link>
            <Link to="/companions" className="flex items-center gap-1.5 text-brand-teal hover:text-white font-medium transition">
              <Users className="w-3.5 h-3.5" />
              <span>Companion Booking</span>
            </Link>
            <Link to="/messages" className="flex items-center gap-1.5 text-sky-400 hover:text-white font-medium transition">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Real-Time Messages</span>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-coral" />
              <span>{userLocation?.city || 'Ranchi, Jharkhand'}</span>
            </div>
            {isAdmin && (
              <span className="bg-brand-coral/20 text-brand-coral border border-brand-coral/40 px-2 py-0.5 rounded-full font-bold">
                Admin Mode
              </span>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-coral to-rose-400 text-white flex items-center justify-center shadow-coral group-hover:scale-105 transition transform">
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-dark to-brand-coral bg-clip-text text-transparent">
                  Let's Resonate
                </span>
                <span className="hidden sm:block text-[10px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
                  Discover • Connect • Experience
                </span>
              </div>
            </Link>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search people, communities, events, gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 rounded-2xl border border-slate-200/80 focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition"
              />
            </div>
          </form>

          {/* Action Icons & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* SOS Emergency Trigger Button */}
            <button
              onClick={() => setShowSosModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-extrabold shadow-sm transition"
              title="Emergency Buddy SOS"
            >
              <ShieldAlert className="w-4 h-4 text-current animate-pulse" />
              <span className="hidden md:inline">SOS</span>
            </button>

            {user ? (
              <>
                <Link
                  to="/messages"
                  className="relative p-2 rounded-xl text-slate-600 hover:text-brand-coral hover:bg-slate-100 transition"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-teal rounded-full animate-ping" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-teal rounded-full" />
                </Link>

                <Link
                  to="/safety"
                  className="p-2 rounded-xl text-slate-600 hover:text-brand-coral hover:bg-slate-100 transition"
                  title="Trust & Safety Hub"
                >
                  <Shield className="w-5 h-5" />
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center gap-2 p-1 pl-2 bg-slate-100 hover:bg-slate-200/80 rounded-2xl border border-slate-200 transition"
                  >
                    <span className="text-xs font-bold text-slate-700 hidden md:inline">
                      {user.name?.split(' ')[0]}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-brand-coral text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                  </button>

                  {profileDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-slide-up"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          Role: {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={`/profile/${user._id}`}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/bookings"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/safety"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span>Trust & Emergency Contacts</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-brand-coral hover:bg-rose-50 rounded-xl"
                          >
                            <Settings className="w-4 h-4 text-brand-coral" />
                            <span>Admin Analytics & Tools</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-coral hover:bg-brand-coralDark rounded-xl shadow-coral transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SOS Modal */}
      <SosModal isOpen={showSosModal} onClose={() => setShowSosModal(false)} />
    </>
  );
};
