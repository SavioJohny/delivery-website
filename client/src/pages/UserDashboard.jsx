import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState({ toMe: [], fromMe: [] });
  const [queries, setQueries] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({ name: '', phone: '', email: '' });
  const [initialProfileData, setInitialProfileData] = useState({ name: '', phone: '', email: '' });
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [resetPassword, setResetPassword] = useState({ current: '', new: '', confirm: '' });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Please log in to access this page');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Fetch user data
    axios.get('http://localhost:5000/api/users/profile', { headers: { 'x-auth-token': token } })
      .then(res => {
        const userData = res.data;
        setUser(userData);
        const profile = { name: userData.name || '', phone: userData.phone || '', email: userData.email || '' };
        setProfileData(profile);
        setInitialProfileData(profile);
      })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to load profile');
          console.error('Profile fetch error:', err);
        }
      });

    // Fetch orders
    axios.get('http://localhost:5000/api/shipments/my-orders', { headers: { 'x-auth-token': token } })
      .then(res => {
        console.log('UserDashboard.jsx: Orders fetched:', res.data);
        setOrders(res.data);
      })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to load orders');
          console.error('Orders fetch error:', err);
        }
      });

    // Fetch queries
    axios.get('http://localhost:5000/api/queries', { headers: { 'x-auth-token': token } })
      .then(res => setQueries(res.data))
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to load queries');
          console.error('Queries fetch error:', err);
        }
      });
  }, [token, navigate]);

  // Check for profile changes
  useEffect(() => {
    const hasChanges =
      profileData.name !== initialProfileData.name ||
      profileData.phone !== initialProfileData.phone ||
      profileData.email !== initialProfileData.email;
    setIsProfileChanged(hasChanges);
  }, [profileData, initialProfileData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfileUpdate = async () => {
    setError('');
    setSuccess('');

    // Validate inputs
    if (!/^\d{10}$/.test(profileData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (profileData.name && !/^[a-zA-Z\s]{1,50}$/.test(profileData.name)) {
      setError('Name must be 1-50 characters and contain only letters and spaces');
      return;
    }

    try {
      await axios.put('http://localhost:5000/api/users/profile', {
        name: profileData.name,
        phone: profileData.phone,
        email: profileData.email
      }, {
        headers: { 'x-auth-token': token }
      });
      setInitialProfileData({ name: profileData.name, phone: profileData.phone, email: profileData.email });
      setUser({ ...user, name: profileData.name, phone: profileData.phone, email: profileData.email });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetPassword.new !== resetPassword.confirm) {
      setError('New passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/users/reset-password', {
        currentPassword: resetPassword.current,
        newPassword: resetPassword.new
      }, { headers: { 'x-auth-token': token } });
      setShowResetPassword(false);
      setResetPassword({ current: '', new: '', confirm: '' });
      setSuccess('Password reset successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm account deletion');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/users/reset-password', {
        currentPassword: deletePassword,
        newPassword: deletePassword // Dummy new password to verify current
      }, { headers: { 'x-auth-token': token } });
      await axios.delete('http://localhost:5000/api/users/delete', {
        headers: { 'x-auth-token': token }
      });
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const renderOrderCard = (order, type) => (
    <div key={order._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-sm mb-4">
      <p className="text-gray-400"><strong className="text-white">Tracking ID:</strong> {order.trackingId}</p>
      <p className="text-gray-400">
        <strong className="text-white">{type === 'toMe' ? 'From' : 'To'}:</strong>{' '}
        {type === 'toMe' ? `${order.senderName}, ${order.senderAddress}` : `${order.receiverName}, ${order.receiverAddress}`}
      </p>
      <p className="text-gray-400">
        <strong className="text-white">Status:</strong>{' '}
        <span className={`font-semibold ${order.status === 'delivered' ? 'text-green-500' : order.status === 'failed' ? 'text-red-500' : 'text-yellow-400'}`}>
          {order.status}
        </span>
      </p>
      <p className="text-gray-400"><strong className="text-white">Package:</strong> {order.packageWeight} kg, {order.packageType}</p>
      {order.orderDate && <p className="text-gray-400"><strong className="text-white">Order Date:</strong> {new Date(order.orderDate).toLocaleDateString('en-GB')}</p>}
      {order.estimatedDelivery && <p className="text-gray-400"><strong className="text-white">Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString('en-GB')}</p>}
      <button
        onClick={() => navigate(`/track/${order.trackingId}`)}
        className="mt-2 w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
        aria-label={`Track details for order ${order.trackingId}`}
      >
        Track Details
      </button>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-red-500 font-inter flex items-center justify-center">
        Please log in to access this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12 pt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6">
        {/* Menu */}
        <div className="md:w-1/4 space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">Menu</h3>
            <div className="space-y-2">
              {['Profile', 'My Orders', 'My Queries', 'Settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left p-2 rounded-lg font-semibold ${
                    activeTab === tab
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                  aria-label={`Switch to ${tab} tab`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
              aria-label="Log out"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="md:w-3/4">
          <h2 className="text-3xl font-bold mb-6">{activeTab}</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
            {/* Profile */}
            {activeTab === 'Profile' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-gray-400">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Enter your name"
                    aria-label="Full name"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-400">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    maxLength="10"
                    placeholder="Enter your phone number"
                    aria-label="Phone number"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-400">Email ID</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Enter your email"
                    aria-label="Email address"
                  />
                </div>
                <div className="flex space-x-4">
                  {isProfileChanged && (
                    <button
                      onClick={handleProfileUpdate}
                      className="flex-1 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
                      aria-label="Save profile changes"
                    >
                      Save Changes
                    </button>
                  )}
                  <button
                    onClick={() => setShowResetPassword(true)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition"
                    aria-label="Reset password"
                  >
                    Reset Password
                  </button>
                </div>
                {showResetPassword && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg max-w-md w-full">
                      <h3 className="text-xl font-bold mb-4 text-yellow-400">Reset Password</h3>
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <input
                          type="password"
                          value={resetPassword.current}
                          onChange={(e) => setResetPassword({ ...resetPassword, current: e.target.value })}
                          placeholder="Current Password"
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          aria-label="Current password"
                        />
                        <input
                          type="password"
                          value={resetPassword.new}
                          onChange={(e) => setResetPassword({ ...resetPassword, new: e.target.value })}
                          placeholder="New Password"
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          aria-label="New password"
                        />
                        <input
                          type="password"
                          value={resetPassword.confirm}
                          onChange={(e) => setResetPassword({ ...resetPassword, confirm: e.target.value })}
                          placeholder="Confirm New Password"
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          aria-label="Confirm new password"
                        />
                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
                            aria-label="Submit password reset"
                          >
                            Reset Password
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowResetPassword(false);
                              setError('');
                            }}
                            className="flex-1 px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition"
                            aria-label="Cancel password reset"
                          >
                            Cancel
                          </button>
                        </div>
                        {error && <p className="text-red-500 text-center">{error}</p>}
                      </form>
                    </div>
                  </div>
                )}
                {success && <p className="text-green-500 text-center mt-4">{success}</p>}
              </div>
            )}

            {/* My Orders */}
            {activeTab === 'My Orders' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400">Orders To Me</h3>
                  {orders.toMe.length > 0 ? (
                    orders.toMe.map(order => renderOrderCard(order, 'toMe'))
                  ) : (
                    <p className="text-gray-400">No orders addressed to you.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400">Orders From Me</h3>
                  {orders.fromMe.length > 0 ? (
                    orders.fromMe.map(order => renderOrderCard(order, 'fromMe'))
                  ) : (
                    <p className="text-gray-400">No orders sent by you.</p>
                  )}
                </div>
              </div>
            )}

            {/* My Queries */}
            {activeTab === 'My Queries' && (
              <div className="space-y-4">
                {queries.length > 0 ? (
                  queries.map(query => (
                    <div key={query._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-sm">
                      <p className="text-gray-400"><strong className="text-white">Type:</strong> {query.type}</p>
                      <p className="text-gray-400"><strong className="text-white">Status:</strong> {query.status}</p>
                      <p className="text-gray-400"><strong className="text-white">Details:</strong> {query.details}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No queries found.</p>
                )}
              </div>
            )}

            {/* Settings */}
            {activeTab === 'Settings' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-yellow-400">Account Settings</h4>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                    aria-label="Delete account"
                  >
                    Delete Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition"
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </div>
                {showDeleteConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg max-w-md w-full">
                      <h3 className="text-xl font-bold mb-4 text-yellow-400">Confirm Account Deletion</h3>
                      <p className="text-gray-400">Enter your password to confirm account deletion. This action cannot be undone.</p>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 mt-4"
                        aria-label="Password for account deletion"
                      />
                      <div className="flex space-x-4 mt-4">
                        <button
                          onClick={handleDeleteAccount}
                          className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                          aria-label="Confirm account deletion"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeletePassword('');
                            setError('');
                          }}
                          className="flex-1 px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition"
                          aria-label="Cancel account deletion"
                        >
                          Cancel
                        </button>
                      </div>
                      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
            {error && !showDeleteConfirm && !showResetPassword && (
              <p className="text-red-500 text-center mt-4">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;