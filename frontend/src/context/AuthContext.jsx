import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authService.getProfile()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
  const res = await authService.login(credentials);

  localStorage.setItem('access_token', res.data.access);
  localStorage.setItem('refresh_token', res.data.refresh);
  const profileRes = await authService.getProfile();
  setUser(profileRes.data);

  return profileRes.data;
};
  const completeSignup = (signupData) => {
    localStorage.setItem('access_token', signupData.access);
    localStorage.setItem('refresh_token', signupData.refresh);
    setUser(signupData.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin' || user?.is_staff || user?.is_superuser || false;
  const isVendor = user?.role === 'vendor';
  const isRider = user?.role === 'rider';
  const isAdmin = isSuperAdmin || isVendor;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      completeSignup,
      logout, 
      isAdmin,
      isVendor,
      isRider,
      isSuperAdmin,
      vendorStatus: user?.vendor_status
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
