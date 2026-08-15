import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass, Users, Calendar, HeartHandshake, MessageSquare,
  ShoppingBag, Shield, ShieldCheck, Settings, Home, PlusCircle,
  Radio, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TrustScoreBadge } from '../common/TrustScoreBadge';

export const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Feed & Discover', icon: Home },
    { to: '/discovery', label: 'Geolocation Radar', icon: Compass, badge: 'Live' },
    { to: '/community', label: 'Communities', icon: Users },
    { to: '/events', label: 'Events & Meetups', icon: Calendar },
    { to: '/companions', label: 'Companions', icon: HeartHandshake, badge: 'Hire' },
    { to: '/messages', label: 'Live Messages', icon: MessageSquare },
    { to: '/marketplace', label: 'Gear Marketplace', icon: ShoppingBag },
    { to: '/safety', label: 'Trust & SOS', icon: Shield },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 flex flex-col gap-4">
        {/* User Mini Profile Card in Sidebar (Inspired by Reference Image 2) */}
        {user && (
          <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-200/80 overflow-hidden relative group">
            {/* Cover Gradient */}
            <div className="h-16 -mx-4 -mt-4 bg-gradient-to-r from-brand-coral via-rose-400 to-brand-teal" />
            
            <div className="relative flex flex-col items-center text-center -mt-8">
              <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md border border-slate-100">
                <div className="w-full h-full rounded-xl bg-brand-coral text-white font-bold text-xl flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
              </div>

              <h3 className="font-extrabold text-slate-900 text-sm mt-2 flex items-center gap-1">
                {user.name}
                {user.verification?.isVerified && (
                  <span className="text-brand-teal text-xs" title="Verified">✓</span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{user.bio || 'Member on Let\'s Resonate'}</p>

              <div className="w-full mt-3 pt-3 border-t border-slate-100">
                <TrustScoreBadge score={user.trustScore || 85} showDetails={true} />
              </div>

              <div className="grid grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-slate-100 text-center">
                <div>
                  <span className="block text-xs font-extrabold text-slate-900">{user.friends?.length || 12}</span>
                  <span className="text-[10px] text-slate-400">Buddies</span>
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-900">4</span>
                  <span className="text-[10px] text-slate-400">Events</span>
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-900">92%</span>
                  <span className="text-[10px] text-slate-400">Trust</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links (Styled with clean deep slate / active pill highlights) */}
        <div className="bg-white rounded-3xl p-3 shadow-card border border-slate-200/80">
          <div className="px-3 py-2 text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
            Navigation Menu
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-current" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-coral/20 text-brand-coral border border-brand-coral/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            {/* Admin Panel (Only visible to Admin role) */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all mt-2 border border-brand-coral/20 ${
                    isActive
                      ? 'bg-brand-coral text-white shadow-coral'
                      : 'bg-rose-50/60 text-brand-coral hover:bg-rose-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-white/80 px-1.5 py-0.5 rounded-md text-brand-coral">
                  Master
                </span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Quick Action Button */}
        <div className="bg-gradient-to-br from-slate-900 to-brand-dark rounded-3xl p-4 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-coral">
              Host An Activity
            </span>
            <h4 className="text-xs font-bold mt-1">Want to create a community or meetup?</h4>
            <div className="flex gap-2 mt-3">
              <NavLink
                to="/events/create"
                className="flex-1 py-2 bg-brand-coral hover:bg-brand-coralDark text-white text-[11px] font-bold rounded-xl text-center shadow transition"
              >
                + Event
              </NavLink>
              <NavLink
                to="/community/create"
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-xl text-center border border-slate-700 transition"
              >
                + Group
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
