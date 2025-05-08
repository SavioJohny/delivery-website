import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  return (
    <nav className="bg-gray-900 bg-opacity-70 backdrop-blur-lg text-white py-1.5 border-b border-gray-700 border-opacity-30 font-inter fixed top-0 w-full z-20">
      <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-lg font-bold">
            ShipEasy
          </Link>
          <span className="text-red-500 text-xl ml-1">.</span>
        </div>
        {/* Links and Button */}
        <div className="flex flex-wrap items-center space-x-3 mt-2 sm:mt-0">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Home
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Profile
            </Link>
          )}
          <Link
            to="/faq"
            className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            FAQ
          </Link>
          <Link
            to="/support"
            className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Support
          </Link>
          {user && user.role === 'admin' && (
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Admin Dashboard
            </Link>
          )}
          {token && (
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;