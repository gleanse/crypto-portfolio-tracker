import { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // TODO: might need to validate token with backend here or no? not sure for now but i USE jwt which as far as i know it use signatures
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authApi.login(username, password);

      localStorage.setItem('access_token', response.access_token);
      setUser({ token: response.access_token });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
