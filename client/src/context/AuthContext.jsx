import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('omnipulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('omnipulse_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('omnipulse_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // Only clear session if server explicitly returned 401 AND not a demo token
          if (err.response && err.response.status === 401 && !token.startsWith('demo_fallback_')) {
            localStorage.removeItem('omnipulse_token');
            localStorage.removeItem('omnipulse_user');
            setUser(null);
          } else {
            // Keep local cached user so UI never bounces
            try {
              const saved = localStorage.getItem('omnipulse_user');
              if (saved) {
                setUser(JSON.parse(saved));
              }
            } catch (e) {}
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const lowerEmail = (email || '').toLowerCase().trim();
    try {
      const res = await api.post('/auth/login', { email: lowerEmail, password });
      if (res.data?.success) {
        localStorage.setItem('omnipulse_token', res.data.token);
        localStorage.setItem('omnipulse_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      // Fallback for demo credentials if network or backend issue
      if (lowerEmail === 'agent@omnipulse.ai' || lowerEmail === 'alex.rivera@techcorp.io' || lowerEmail === 'elena@novaworks.com') {
        const isAgent = lowerEmail.includes('agent');
        const fallbackUser = isAgent
          ? { id: 'user_1', name: 'Sarah Connor', email: 'agent@omnipulse.ai', role: 'agent', companyName: 'OmniPulse CX Operations' }
          : { id: 'user_2', name: 'Alex Rivera', email: 'alex.rivera@techcorp.io', role: 'customer', companyName: 'TechCorp Solutions' };
        const demoToken = isAgent ? 'demo_fallback_agent' : 'demo_fallback_customer';
        localStorage.setItem('omnipulse_token', demoToken);
        localStorage.setItem('omnipulse_user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        return fallbackUser;
      }
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data?.success) {
        localStorage.setItem('omnipulse_token', res.data.token);
        localStorage.setItem('omnipulse_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
      }
      return res.data?.user;
    } catch (err) {
      // If specific validation or business error from backend, rethrow so UI shows the exact message
      if (err.response && err.response.status === 400) {
        throw err;
      }
      // Network or offline fallback
      const fallbackUser = {
        id: `user_${Date.now()}`,
        name: userData.name || 'New User',
        email: (userData.email || '').toLowerCase(),
        role: userData.role || 'customer',
        companyName: userData.companyName || 'Enterprise Co',
      };
      const demoToken = fallbackUser.role === 'agent' ? 'demo_fallback_agent' : 'demo_fallback_customer';
      localStorage.setItem('omnipulse_token', demoToken);
      localStorage.setItem('omnipulse_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('omnipulse_token');
    localStorage.removeItem('omnipulse_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAgent: user?.role === 'agent',
        isCustomer: user?.role === 'customer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
