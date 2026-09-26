import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('familyvault_token'));
  const [loading, setLoading] = useState(true);

  // Load current user from token on startup
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('familyvault_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success) {
            setUser(res.user);
            setFamily(res.family);
            setMembers(res.members || []);
          } else {
            logout();
          }
        } catch (error) {
          console.warn('Authentication token check failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('familyvault_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setFamily(res.family);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const demoLogin = async () => {
    return login('demo@familyvault.app', 'Demo@123');
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await authApi.register({ name, email, password, confirmPassword });
    if (res.success && res.token) {
      localStorage.setItem('familyvault_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setFamily(res.family);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('familyvault_token');
    setToken(null);
    setUser(null);
    setFamily(null);
    setMembers([]);
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    if (res.success) {
      setUser((prev) => ({ ...prev, ...res.user }));
    }
    return res;
  };

  const completeOnboarding = async (data) => {
    const res = await authApi.completeOnboarding(data);
    if (res.success) {
      setUser((prev) => ({ ...prev, ...res.user }));
      setFamily(res.family);
      setMembers(res.members || []);
    }
    return res;
  };

  const refreshFamily = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success) {
        setUser(res.user);
        setFamily(res.family);
        setMembers(res.members || []);
      }
    } catch (e) {
      console.error('Failed to refresh family data:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        family,
        members,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
        completeOnboarding,
        refreshFamily,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
