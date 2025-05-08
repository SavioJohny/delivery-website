import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function DeliveryOptions() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { pickup, delivery, packaging, dimensions, weight, contents, packageValue, pickupDate } = state || {};
  const [showPickupDetails, setShowPickupDetails] = useState(false);
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [securePackage, setSecurePackage] = useState(false);
  const [deliveryType, setDeliveryType] = useState('');
  const [error, setError] = useState('');

  // Calculate delivery date based on pickup date and delivery type
  const calculateDeliveryDate = (type) => {
    if (!pickupDate) return 'N/A';
    const [day, month, year] = pickupDate.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const daysToAdd = type === 'EXPRESS' ? 3 : 5;
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleNext = () => {
    if (!deliveryType) {
      setError('Please select a delivery type');
      return;
    }
    setError('');
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
        securePackage,
        deliveryType,
        deliveryDate: calculateDeliveryDate(deliveryType),
        totalCost: (deliveryType === 'EXPRESS' ? 1300 : 1000) + (securePackage ? 100 : 0)
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6">
        {/* Order Summary (Left Side) */}
        <div className="md:w-1/3 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          <div className="space-y-6">
            {/* Address Details */}
            <div>
              <h4 className="text-lg font-medium mb-2">Address Details</h4>
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
                      <p><strong>PIN:</strong> {delivery?.pin}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Package Details */}
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
            {/* Pickup Date */}
            <div>
              <h4 className="text-lg font-medium mb-2">Pickup Date</h4>
              <div className="text-sm text-gray-400">
                <p>{pickupDate || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Section (Right Side) */}
        <div className="md:w-2/3">
          <h2 className="text-3xl font-bold mb-6">Delivery Options</h2>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Delivery Options</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={securePackage}
                  onChange={() => setSecurePackage(!securePackage)}
                  className="mr-2 accent-yellow-400"
                />
                <span className="text-gray-400">Secure your package for just ₹100</span>
              </label>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-2">Select Delivery Type</h4>
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
            </div>
            <button
              onClick={handleNext}
              className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition mt-4"
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

export default DeliveryOptions;