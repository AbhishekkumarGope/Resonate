import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { GeolocationDiscovery } from './pages/discovery/GeolocationDiscovery';
import { CommunitiesList } from './pages/community/CommunitiesList';
import { CommunityDetail } from './pages/community/CommunityDetail';
import { CreateCommunity } from './pages/community/CreateCommunity';
import { EventsList } from './pages/events/EventsList';
import { EventDetail } from './pages/events/EventDetail';
import { CreateEvent } from './pages/events/CreateEvent';
import { CompanionsList } from './pages/companions/CompanionsList';
import { CompanionDetail } from './pages/companions/CompanionDetail';
import { MyBookings } from './pages/bookings/MyBookings';
import { MessagesPage } from './pages/messages/MessagesPage';
import { MarketplaceList } from './pages/marketplace/MarketplaceList';
import { CreateListing } from './pages/marketplace/CreateListing';
import { SafetyHub } from './pages/safety/SafetyHub';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center text-xs font-bold text-slate-500">
        Loading Let's Resonate...
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Main Core Platform Routes */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/discovery" element={<ProtectedRoute><GeolocationDiscovery /></ProtectedRoute>} />

      {/* Community Routes */}
      <Route path="/community" element={<ProtectedRoute><CommunitiesList /></ProtectedRoute>} />
      <Route path="/community/create" element={<ProtectedRoute><CreateCommunity /></ProtectedRoute>} />
      <Route path="/community/:id" element={<ProtectedRoute><CommunityDetail /></ProtectedRoute>} />

      {/* Events Routes */}
      <Route path="/events" element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
      <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />

      {/* Companion Routes */}
      <Route path="/companions" element={<ProtectedRoute><CompanionsList /></ProtectedRoute>} />
      <Route path="/companions/:id" element={<ProtectedRoute><CompanionDetail /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

      {/* Chat & Messages */}
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

      {/* Marketplace */}
      <Route path="/marketplace" element={<ProtectedRoute><MarketplaceList /></ProtectedRoute>} />
      <Route path="/marketplace/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />

      {/* Safety & Emergency Contacts */}
      <Route path="/safety" element={<ProtectedRoute><SafetyHub /></ProtectedRoute>} />

      {/* User Profile */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Admin Panel (Enforced by AdminDashboard component & protect middleware) */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
