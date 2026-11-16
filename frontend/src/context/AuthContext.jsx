import { createContext, useContext, useState, useEffect } from 'react';

import $api from '@/api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  //check if token in local storage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await $api.get('/user/me');
        console.log(res.data);
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (token) => {
    localStorage.setItem('accessToken', token);
    const res = await $api.get('/user/me');
    const userData = res.data;
    setUser(userData);
    setIsAuthenticated(true);
    return user;
  };

  const logout = async () => {
    try {
      await $api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    }

    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
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
