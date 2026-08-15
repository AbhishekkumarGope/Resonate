import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('resonate_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('resonate_token'));
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({
    latitude: 23.3441,
    longitude: 85.3096,
    city: 'Ranchi',
    address: 'Main Road, Ranchi'
  });

  // Fetch current user details and auto detect location on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('resonate_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('resonate_user', JSON.stringify(res.data.user));
            if (res.data.user.location?.coordinates?.length === 2 && res.data.user.location.coordinates[0] !== 0) {
              setUserLocation({
                longitude: res.data.user.location.coordinates[0],
                latitude: res.data.user.location.coordinates[1],
                city: res.data.user.location.city || 'Ranchi',
                address: res.data.user.location.address || 'Ranchi'
              });
            }
          }
        } catch (err) {
          console.warn('Session check failed, clearing token');
          localStorage.removeItem('resonate_token');
          localStorage.removeItem('resonate_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    // Geolocation detection
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            city: 'Current Location',
            address: 'Detected via GPS'
          };
          setUserLocation(coords);
          // If logged in, update user location in backend
          if (localStorage.getItem('resonate_token')) {
            api.post('/users/update-location', coords).catch(() => {});
          }
        },
        () => {
          // Default to Ranchi coordinates
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('resonate_token', res.data.token);
      localStorage.setItem('resonate_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('resonate_token', res.data.token);
      localStorage.setItem('resonate_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('resonate_token');
    localStorage.removeItem('resonate_user');
    setUser(null);
    setToken(null);
  };

  const updateUserState = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('resonate_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        userLocation,
        setUserLocation,
        login,
        register,
        logout,
        updateUserState,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
