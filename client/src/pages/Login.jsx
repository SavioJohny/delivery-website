import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect query parameter
  const query = new URLSearchParams(location.search);
  const redirect = query.get('redirect') || 'dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Phone/Email and password are required');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        identifier,
        password,
      });
      console.log('Login.jsx: Login successful, token:', response.data.token);
      localStorage.setItem('token', response.data.token);
      await login({ identifier, password });
      setError('');
      navigate(redirect === 'place-order' ? '/place-order' : '/dashboard');
    } catch (err) {
      console.error('Login.jsx: Login error:', err.response?.data || err.message);
      if (err.response?.status === 404) {
        setShowRegister(true);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', registerData);
      console.log('Login.jsx: Register successful');
      setError('');
      setShowRegister(false);
      setRegisterData({ name: '', phone: '', email: '', password: '' });
      alert('Registration successful! Please log in.');
    } catch (err) {
      console.error('Login.jsx: Register error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">{showRegister ? 'Register' : 'Login'}</h2>
        {!showRegister ? (
          <form onSubmit={handleLogin} className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Phone Number or Email</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter phone or email"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
            >
              Login
            </button>
            <p className="text-center text-gray-400 mt-2">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setShowRegister(true);
                  setError('');
                }}
                className="text-yellow-400 hover:text-yellow-500 hover:underline"
              >
                Register
              </button>
            </p>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </form>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Register</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Full Name</label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Phone Number</label>
                <input
                  type="text"
                  value={registerData.phone}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                  placeholder="Phone Number"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  maxLength="10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="Email"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Password</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Password"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
              {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;