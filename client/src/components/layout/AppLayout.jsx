import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';

export const AppLayout = ({ children, showRightSidebar = true, fullWidth = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-lightBg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Body */}
          <div className={`flex-1 min-w-0 ${fullWidth ? 'w-full' : ''}`}>
            {children}
          </div>

          {/* Right Sidebar */}
          {showRightSidebar && <RightSidebar />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Let's Resonate</span>
            <span>• Location-Based Social & Companion Discovery</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/safety" className="hover:text-brand-coral">Trust & Safety</a>
            <a href="/discovery" className="hover:text-brand-coral">Geolocation</a>
            <a href="/companions" className="hover:text-brand-coral">Companions</a>
            <span>© 2026 Let's Resonate</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
