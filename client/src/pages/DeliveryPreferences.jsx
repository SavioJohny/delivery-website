import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';

function DeliveryPreferences() {
  const { user } = useContext(AuthContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { pickup, delivery, packaging, dimensions, weight, contents, packageValue, pickupDate } = state || {};

  const [deliveryPreferences, setDeliveryPreferences] = useState({
    timeSlot: '',
    packaging: 'standard'
  });
  const [deliveryType, setDeliveryType] = useState('');
  const [error, setError] = useState('');

  const timeSlots = ['9:00 AM - 12:00 PM', '12:00 PM - 3:00 PM', '3:00 PM - 6:00 PM'];
  const packagingOptions = ['standard', 'eco-friendly', 'premium'];

  // Calculate delivery date based on pickup date and delivery type
  const calculateDeliveryDate = (type) => {
    if (!pickupDate) return 'N/A';
    const [day, month, year] = pickupDate.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const daysToAdd = type === 'EXPRESS' ? 3 : 5;
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!deliveryPreferences.timeSlot) {
      setError('Please select a delivery time slot');
      return;
    }
    if (!deliveryType) {
      setError('Please select a delivery type');
      return;
    }

    try {
      const totalCost = deliveryType === 'EXPRESS' ? 1300 : 1000;
      const response = await axios.post('http://localhost:5000/api/orders', {
        userId: user._id,
        pickup,
        delivery,
        packaging,
        dimensions,
        weight,
        contents,
        packageValue,
        pickupDate,
        deliveryPreferences,
        deliveryType,
        deliveryDate: calculateDeliveryDate(deliveryType),
        totalCost,
        status: 'pending'
      }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });

      navigate('/payment-gateway', {
        state: {
          pickup,
          delivery,
          packaging,
          dimensions,
          weight,
          contents,
          packageValue,
          pickupDate,
          deliveryPreferences,
          deliveryType,
          deliveryDate: calculateDeliveryDate(deliveryType),
          totalCost,
          trackingId: response.data.trackingId
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6">
        {/* Order Summary (Left Side) */}
        <div className="md:w-1/3 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-2">Address Details</h4>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{pickup?.contactName || 'N/A'}</p>
                  <p className="text-sm text-gray-400">{pickup?.flat}, {pickup?.area}, {pickup?.city}, {pickup?.state}, {pickup?.pin}</p>
                </div>
                <div>
                  <p className="font-medium">{delivery?.contactName || 'N/A'}</p>
                  <p className="text-sm text-gray-400">{delivery?.flat}, {delivery?.area}, {delivery?.city}, {delivery?.state}, {delivery?.pin}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-2">Package Details</h4>
              <div className="text-sm text-gray-400 space-y-2">
                <p><strong>Packaging:</strong> {packaging || 'N/A'}</p>
                <p><strong>Package Content:</strong> {contents?.join(', ') || 'N/A'}</p>
                <p><strong>Dimensions:</strong> {dimensions?.length} x {dimensions?.breadth} x {dimensions?.height} {dimensions?.unit}</p>
                <p><strong>Weight:</strong> {weight} kg</p>
                <p><strong>Package Value:</strong> ₹{packageValue}</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-2">Pickup Date</h4>
              <p className="text-sm text-gray-400">{pickupDate || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Delivery Preferences Form (Right Side) */}
        <div className="md:w-2/3">
          <h2 className="text-3xl font-bold mb-6">Delivery Preferences</h2>
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
            <div>
              <label className="block mb-1 text-gray-400">Delivery Time Slot</label>
              <select
                value={deliveryPreferences.timeSlot}
                onChange={(e) => setDeliveryPreferences({ ...deliveryPreferences, timeSlot: e.target.value })}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                <option value="" className="text-gray-500">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-400">Packaging Option</label>
              <select
                value={deliveryPreferences.packaging}
                onChange={(e) => setDeliveryPreferences({ ...deliveryPreferences, packaging: e.target.value })}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                {packagingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-400">Delivery Type</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="SURFACE"
                    checked={deliveryType === 'SURFACE'}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="mr-2 accent-yellow-400"
                  />
                  <span className="text-gray-400">SURFACE: ₹1000, Delivery by {calculateDeliveryDate('SURFACE')} (5 days)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="EXPRESS"
                    checked={deliveryType === 'EXPRESS'}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="mr-2 accent-yellow-400"
                  />
                  <span className="text-gray-400">EXPRESS: ₹1300, Delivery by {calculateDeliveryDate('EXPRESS')} (3 days)</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
            >
              Proceed to Payment
            </button>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default DeliveryPreferences;