import { useState, useCallback } from 'react';
import api from '../config/api';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { username, role });
      const { accessToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra tài khoản.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return { login, logout, loading, error };
};
