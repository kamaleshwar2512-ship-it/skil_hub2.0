import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]       = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('skil_access_token');
    const storedUser = localStorage.getItem('skil_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user: userData } = data.data;
    localStorage.setItem('skil_access_token', accessToken);
    localStorage.setItem('skil_refresh_token', refreshToken);
    localStorage.setItem('skil_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await axiosInstance.post('/auth/register', formData);
    const { accessToken, refreshToken, user: userData } = data.data;
    localStorage.setItem('skil_access_token', accessToken);
    localStorage.setItem('skil_refresh_token', refreshToken);
    localStorage.setItem('skil_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('skil_access_token');
    localStorage.removeItem('skil_refresh_token');
    localStorage.removeItem('skil_user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUserCache = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('skil_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateUserCache }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
