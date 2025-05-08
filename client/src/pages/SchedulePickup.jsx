import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

function SchedulePickup() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);
  const { pickup, delivery, packaging, dimensions, weight, contents, packageValue } = state || {};
  const [showPickupDetails, setShowPickupDetails] = useState(false);
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  if (!loading && !user) {
    navigate('/login', { state: { from: location.pathname } });
    return null;
  }

  // Calculate available pickup dates (day after tomorrow, skip Sundays)
  const getAvailableDates = () => {
    const dates = [];
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 2); // Start from day after tomorrow

    while (dates.length < 3) {
      if (currentDate.getDay() !== 0) { // Skip Sunday (0)
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleNext = () => {
    if (!pickupDate) {
      setError('Please select a pickup date');
      return;
    }
    setError('');
    navigate('/delivery-preferences', {
      state: {
        pickup,
        delivery,
        packaging,
        dimensions,
        weight,
        contents,
        packageValue,
        pickupDate
      }
    });
  };

  if (loading) {
    return <div className="min-h-screen w-full bg-gray-900 text-white font-inter flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6">
        {/* Order Summary (Left Side) */}
        <div className="md:w-1/3 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Order Summary</h3>
          <div className="space-y-6">
            {/* Address Details */}
            <div>
              <h4 className="text-lg font-medium mb-2 text-gray-400">Address Details</h4>
              <div className="space-y-4">
                {/* Pickup Address */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{pickup?.contactName || 'N/A'}</p>
                      <p className="text-sm text-gray-400">{pickup?.state}, {pickup?.pin}</p>
                    </div>
                    <button
                      onClick={() => setShowPickupDetails(!showPickupDetails)}
                      className="text-yellow-400 hover:text-yellow-500"
                      aria-label="Toggle pickup address details"
                      aria-expanded={showPickupDetails}
                    >
                      {showPickupDetails ? '▲' : '▼'}
                    </button>
                  </div>
                  {showPickupDetails && (
                    <div className="mt-2 text-sm text-gray-400 pl-4">
                      <p><strong>Contact Name:</strong> {pickup?.contactName}</p>
                      <p><strong>Mobile:</strong> {pickup?.mobile}</p>
                      <p><strong>Email:</strong> {pickup?.email}</p>
                      <p><strong>Flat:</strong> {pickup?.flat}</p>
                      <p><strong>Area:</strong> {pickup?.area}</p>
                      <p><strong>State:</strong> {pickup?.state}</p>
                      <p><strong>City:</strong> {pickup?.city}</p>
                      <p><strong>PIN:</strong> {pickup?.pin}</p>
                    </div>
                  )}
                </div>
                {/* Delivery Address */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{delivery?.contactName || 'N/A'}</p>
                      <p className="text-sm text-gray-400">{delivery?.state}, {delivery?.pin}</p>
                    </div>
                    <button
                      onClick={() => setShowDeliveryDetails(!showDeliveryDetails)}
                      className="text-yellow-400 hover:text-yellow-500"
                      aria-label="Toggle delivery address details"
                      aria-expanded={showDeliveryDetails}
                    >
                      {showDeliveryDetails ? '▲' : '▼'}
                    </button>
                  </div>
                  {showDeliveryDetails && (
                    <div className="mt-2 text-sm text-gray-400 pl-4">
                      <p><strong>Contact Name:</strong> {delivery?.contactName}</p>
                      <p><strong>Mobile:</strong> {delivery?.mobile}</p>
                      <p><strong>Email:</strong> {delivery?.email}</p>
                      <p><strong>Flat:</strong> {delivery?.flat}</p>
                      <p><strong>Area:</strong> {delivery?.area}</p>
                      <p><strong>State:</strong> {delivery?.state}</p>
                      <p><strong>City:</strong> {delivery?.city}</p>
                      <p><strong>PIN:</strong> {pickup?.pin}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Package Details */}
            <div>
              <h4 className="text-lg font-medium mb-2 text-gray-400">Package Details</h4>
              <div className="text-sm text-gray-400 space-y-2">
                <p><strong>Packaging:</strong> {packaging || 'N/A'}</p>
                <p><strong>Package Content:</strong> {contents?.join(', ') || 'N/A'}</p>
                <p><strong>Dimensions:</strong> {dimensions?.length} x {dimensions?.breadth} x {dimensions?.height} {dimensions?.unit}</p>
                <p><strong>Weight:</strong> {weight} kg</p>
                <p><strong>Package Value:</strong> ₹{packageValue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Section (Right Side) */}
        <div className="md:w-2/3">
          <h2 className="text-3xl font-bold mb-6">Schedule Pickup</h2>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Pickup Schedule</h3>
            <div className="mb-4">
              <label className="block mb-1 text-gray-400">Select Pickup Day</label>
              <select
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Select pickup date"
              >
                <option value="" className="text-gray-500">Select a date</option>
                {availableDates.map((date) => (
                  <option key={date.toISOString()} value={formatDate(date)}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleNext}
              className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
              aria-label="Proceed to delivery preferences"
            >
              Next
            </button>
          </div>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default SchedulePickup;