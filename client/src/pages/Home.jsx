import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';

function Home() {
  const { user } = useContext(AuthContext);
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    if (!trackingId) {
      setError('Please enter a Tracking ID');
      return;
    }
    try {
      console.log('Tracking ID:', trackingId);
      const response = await axios.get(`http://localhost:5000/api/shipments/track/${trackingId}`);
      navigate(`/track/${trackingId}`, { state: { shipment: response.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to track shipment');
    }
  };

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
      console.log('Home.jsx: Login successful, token:', response.data.token);
      localStorage.setItem('token', response.data.token);
      await login({ identifier, password });
      setError('');
      setShowLoginModal(false);
      setIdentifier('');
      setPassword('');
      navigate('/dashboard');
    } catch (err) {
      console.error('Home.jsx: Login error:', err.response?.data || err.message);
      if (err.response?.status === 404) {
        setShowLoginModal(false);
        setShowRegisterModal(true);
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
      console.log('Home.jsx: Register successful');
      setError('');
      setShowRegisterModal(false);
      setRegisterData({ name: '', phone: '', email: '', password: '' });
      alert('Registration successful! Please log in.');
      setShowLoginModal(true);
    } catch (err) {
      console.error('Home.jsx: Register error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const serviceUpdates = [
    "Beware of emails or communications from any other website",
    "Please do not transfer money to payment links that are not shared from ShipEasy's official accounts",
    "ShipEasy does not require OTP or credentials for address confirmation for your delivery",
    "Our Customer Support team is reachable only from our website or app",
    "Login with your phone number and raise your support request with us",
  ];

  return (
    <div className="w-full bg-gray-900 text-white font-inter">
      {/* Hero Section with Background Image */}
      <div
        className="relative w-full h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('https://www.dropoff.com/wp-content/uploads/2022/05/Shipping-vs-Delivery-What_s-the-Difference_-02-1024x600.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to ShipEasy</h1>
          <p className="text-xl text-gray-300 mb-8">
            Your trusted partner for seamless shipping and tracking.
          </p>
        </div>
      </div>

      {/* Service Updates Marquee */}
      <div className="bg-yellow-400 text-black py-2 overflow-hidden">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          <span className="font-semibold">
            SERVICE UPDATES: {serviceUpdates.join(' • ')}
          </span>
        </marquee>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Track and Ship Section */}
        <div className="w-full flex flex-col items-center space-y-6">
          {!user && (
            <div className="w-full flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setError('');
                }}
                className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setShowRegisterModal(true);
                  setError('');
                }}
                className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Register
              </button>
            </div>
          )}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-start">
              <h2 className="text-xl font-semibold mb-4 text-center">Track Order</h2>
              <form onSubmit={handleTrack} className="space-y-4">
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  placeholder="Enter Tracking ID (e.g., TRK-123456)"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Track Order
                </button>
              </form>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-end">
              <h2 className="text-xl font-semibold mb-4 text-center">Ship Order</h2>
              <button
                onClick={() => navigate(user ? '/place-order' : '/login?redirect=place-order')}
                className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                {user ? 'Ship Order' : 'Log In to Ship Order'}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 mt-4 text-center text-sm">{error}</p>}
        </div>

        {/* About ShipEasy Section */}
        <div className="py-12">
          <h2 className="text-3xl font-bold mb-6 text-center">About ShipEasy</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2">
              <img
                src="https://www.reshot.com/preview-assets/illustrations/TMQS7XFPNY/delivery-company-service-TMQS7XFPNY-w1600.jpg"
                alt="Shipping illustration"
                className="w-full rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <p className="text-gray-400 leading-relaxed">
                ShipEasy is your go-to platform for hassle-free shipping and tracking. Whether you're sending a package across the city or across the globe, we ensure your shipments are handled with care and delivered on time. Our platform offers real-time tracking, secure payment options, and dedicated customer support to make your shipping experience seamless.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Choose ShipEasy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <img
                src="https://img.freepik.com/free-vector/post-service-tracking-abstract-concept-vector-illustration-parcel-monitor-track-trace-your-shipment-package-tracking-number-express-delivery-online-shopping-mail-box-abstract-metaphor_335657-1777.jpg?t=st=1746540935~exp=1746544535~hmac=29172d87138621c296b0b414f631e07fb47d037482c770266c32b39b4ea9b358&w=740"
                alt="Track shipment"
                className="w-16 h-16 mx-auto mb-4 rounded-full"
              />
              <h3 className="text-lg font-semibold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-400">
                Track your shipments in real-time with our advanced tracking system.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <img
                src="https://as1.ftcdn.net/jpg/01/67/05/32/1000_F_167053206_fugsRJcgItafb17ghOmIzLJBUsG9ibkE.jpg"
                alt="Secure shipping"
                className="w-16 h-16 mx-auto mb-4 rounded-full"
              />
              <h3 className="text-lg font-semibold mb-2">Secure Shipping</h3>
              <p className="text-gray-400">
                Your packages are handled with care and delivered safely to their destination.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <img
                src="https://content3.jdmagicbox.com/comp/ernakulam/l1/0484px484.x484.171214194032.b5l1/catalogue/travancore-support-services-pvt-ltd-vennala-ernakulam-electricians-xlv0w.jpg"
                alt="Customer support"
                className="w-16 h-16 mx-auto mb-4 rounded-full"
              />
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-400">
                Our support team is available round-the-clock to assist you.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-12">
          <h2 className="text-3xl font-bold mb-6 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-400 italic mb-4">
                "ShipEasy made shipping my packages so easy! The tracking feature is fantastic, and I always know where my shipments are."
              </p>
              <p className="text-sm font-semibold">- Jacob James</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-400 italic mb-4">
                "I love how secure and reliable ShipEasy is. Their customer support team was very helpful when I had a query."
              </p>
              <p className="text-sm font-semibold">- Sara Joseph</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Phone Number or Email</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter phone or email"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Login
              </button>
              <p className="text-center text-sm text-gray-400 mt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                    setError('');
                  }}
                  className="text-yellow-400 hover:underline focus:outline-none"
                >
                  Register
                </button>
              </p>
              {error && <p className="text-red-500 text-center text-sm">{error}</p>}
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setError('');
                  setIdentifier('');
                  setPassword('');
                }}
                className="w-full px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Register</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Full Name</label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Register
              </button>
              <p className="text-center text-sm text-gray-400 mt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                    setError('');
                  }}
                  className="text-yellow-400 hover:underline focus:outline-none"
                >
                  Login
                </button>
              </p>
              {error && <p className="text-red-500 text-center text-sm">{error}</p>}
              <button
                type="button"
                onClick={() => {
                  setShowRegisterModal(false);
                  setError('');
                  setRegisterData({ name: '', phone: '', email: '', password: '' });
                }}
                className="w-full px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;