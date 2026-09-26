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
        if (storedToken === 'demo_jwt_token_reddy_vault_2026') {
          const cachedUser = localStorage.getItem('familyvault_user');
          const cachedFam = localStorage.getItem('familyvault_family');
          const cachedMemb = localStorage.getItem('familyvault_members');
          setUser(cachedUser ? JSON.parse(cachedUser) : { name: 'Suresh Reddy', email: 'demo@familyvault.app', role: 'Admin' });
          setFamily(cachedFam ? JSON.parse(cachedFam) : { name: 'The Reddy Family', plan: 'Premium Guard' });
          setMembers(cachedMemb ? JSON.parse(cachedMemb) : [
            { id: '1', name: 'Suresh Reddy', role: 'Vault Owner', relation: 'Head', email: 'suresh@reddy.family', avatar: '👨‍💼', accessLevel: 'admin' },
            { id: '2', name: 'Lakshmi Reddy', role: 'Co-Owner', relation: 'Spouse', email: 'lakshmi@reddy.family', avatar: '👩‍💼', accessLevel: 'admin' },
            { id: '3', name: 'Aarav Reddy', role: 'Dependent', relation: 'Son', email: 'aarav@reddy.family', avatar: '👦', accessLevel: 'view' },
            { id: '4', name: 'Ananya Reddy', role: 'Dependent', relation: 'Daughter', email: 'ananya@reddy.family', avatar: '👧', accessLevel: 'view' },
          ]);
          setLoading(false);
          return;
        }

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
    try {
      return await login('demo@familyvault.app', 'Demo@123');
    } catch (err) {
      console.warn('Backend server not directly reachable, initializing client-side Reddy Family Demo session:', err.message);
      const demoUser = {
        _id: 'usr_demo_reddy',
        id: 'usr_demo_reddy',
        name: 'Suresh Reddy',
        email: 'demo@familyvault.app',
        role: 'Admin',
        phone: '+1 (555) 382-9901',
      };
      const demoFamily = {
        _id: 'fam_demo_reddy',
        id: 'fam_demo_reddy',
        name: 'The Reddy Family',
        plan: 'Premium Guard',
      };
      const demoMembers = [
        { id: '1', name: 'Suresh Reddy', role: 'Vault Owner', relation: 'Head', email: 'suresh@reddy.family', avatar: '👨‍💼', accessLevel: 'admin' },
        { id: '2', name: 'Lakshmi Reddy', role: 'Co-Owner', relation: 'Spouse', email: 'lakshmi@reddy.family', avatar: '👩‍💼', accessLevel: 'admin' },
        { id: '3', name: 'Aarav Reddy', role: 'Dependent', relation: 'Son', email: 'aarav@reddy.family', avatar: '👦', accessLevel: 'view' },
        { id: '4', name: 'Ananya Reddy', role: 'Dependent', relation: 'Daughter', email: 'ananya@reddy.family', avatar: '👧', accessLevel: 'view' },
      ];
      const demoToken = 'demo_jwt_token_reddy_vault_2026';
      localStorage.setItem('familyvault_token', demoToken);
      localStorage.setItem('familyvault_user', JSON.stringify(demoUser));
      localStorage.setItem('familyvault_family', JSON.stringify(demoFamily));
      localStorage.setItem('familyvault_members', JSON.stringify(demoMembers));
      setToken(demoToken);
      setUser(demoUser);
      setFamily(demoFamily);
      setMembers(demoMembers);
      return { success: true, user: demoUser, family: demoFamily };
    }
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
    localStorage.removeItem('familyvault_user');
    localStorage.removeItem('familyvault_family');
    localStorage.removeItem('familyvault_members');
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
