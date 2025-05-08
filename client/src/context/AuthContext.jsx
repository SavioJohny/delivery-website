import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicRoutes = ['/', '/login', '/register', '/faq', '/support'];
    const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/track/');

    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('AuthContext: Checking token:', storedToken);

      if (!storedToken) {
        console.log('AuthContext: No token found');
        setLoading(false);
        if (!isPublicRoute) {
          navigate('/login', { state: { from: location.pathname } });
        }
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { 'x-auth-token': storedToken },
        });
        console.log('AuthContext: Profile fetched:', res.data);
        setUser(res.data);
        setToken(storedToken);
        setLoading(false);
      } catch (err) {
        console.error('AuthContext: Token validation error:', err.response?.data || err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          if (!isPublicRoute) {
            navigate('/login', { state: { from: location.pathname } });
          }
        }
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, location.pathname]);

  const login = async ({ identifier, password }) => {
    console.log('AuthContext: Login attempt:', { identifier, password });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { identifier, password });
      console.log('AuthContext: Login successful, token:', res.data.token);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      const profile = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { 'x-auth-token': res.data.token },
      });
      console.log('AuthContext: Profile set:', profile.data);
      setUser(profile.data);
    } catch (err) {
      console.error('AuthContext: Login error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;