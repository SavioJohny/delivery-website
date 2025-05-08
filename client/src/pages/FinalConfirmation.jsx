import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function FinalConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    trackingId,
    pickup = {},
    delivery = {},
    packaging,
    dimensions,
    weight,
    contents,
    packageValue,
    pickupDate,
    deliveryPreferences = {},
    deliveryType,
    deliveryDate,
    totalCost,
    paymentMethod,
    upiId,
    cardNumber
  } = state || {};

  // Format dimensions object as string
  const formatDimensions = (dims) => {
    if (!dims || typeof dims !== 'object') return 'N/A';
    const { length, breadth, height, unit } = dims;
    if (!length || !breadth || !height || !unit) return 'N/A';
    return `${length} x ${breadth} x ${height} ${unit}`;
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Shipment Confirmation</h1>
        {trackingId ? (
          <div className="bg-gray-800 p-6 rounded-lg border border-green-500 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold mb-2 text-green-500">Payment Confirmed!</h2>
            <p className="text-sm text-gray-400 mb-2">Order placed successfully. Track your shipment below:</p>
            <p className="text-base font-medium">Tracking ID: <span className="font-bold text-yellow-400">{trackingId}</span></p>
            {/* Row 1: Pickup Address and Delivery Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-base font-medium mb-1 text-gray-400">Pickup Address</h3>
                <p className="text-sm text-gray-400">Name: {pickup.contactName || 'N/A'}</p>
                <p className="text-sm text-gray-400">Phone: {pickup.mobile || 'N/A'}</p>
                <p className="text-sm text-gray-400">Email: {pickup.email || 'N/A'}</p>
                <p className="text-sm text-gray-400">Address: {`${pickup.flat || ''}, ${pickup.area || ''}, ${pickup.city || ''}, ${pickup.state || ''}, ${pickup.pin || ''}`}</p>
              </div>
              <div>
                <h3 className="text-base font-medium mb-1 text-gray-400">Delivery Address</h3>
                <p className="text-sm text-gray-400">Name: {delivery.contactName || 'N/A'}</p>
                <p className="text-sm text-gray-400">Phone: {delivery.mobile || 'N/A'}</p>
                <p className="text-sm text-gray-400">Email: {delivery.email || 'N/A'}</p>
                <p className="text-sm text-gray-400">Address: {`${delivery.flat || ''}, ${delivery.area || ''}, ${delivery.city || ''}, ${delivery.state || ''}, ${pickup.pin || ''}`}</p>
              </div>
            </div>
            {/* Row 2: Package, Delivery Details, Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <h3 className="text-base font-medium mb-1 text-gray-400">Package</h3>
                <p className="text-sm text-gray-400">Weight: {weight ? `${weight} kg` : 'N/A'}</p>
                <p className="text-sm text-gray-400">Dimensions: {formatDimensions(dimensions)}</p>
                <p className="text-sm text-gray-400">Contents: {contents ? contents.join(', ') : 'N/A'}</p>
                <p className="text-sm text-gray-400">Packaging: {packaging || 'N/A'}</p>
                <p className="text-sm text-gray-400">Value: {packageValue ? `₹${packageValue}` : 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-base font-medium mb-1 text-gray-400">Delivery Details</h3>
                <p className="text-sm text-gray-400">Type: {deliveryType || 'N/A'}</p>
                <p className="text-sm text-gray-400">Time Slot: {deliveryPreferences.timeSlot || 'N/A'}</p>
                <p className="text-sm text-gray-400">Packaging: {deliveryPreferences.packaging || 'N/A'}</p>
                <p className="text-sm text-gray-400">Pickup Date: {pickupDate || 'N/A'}</p>
                <p className="text-sm text-gray-400">Delivery Date: {deliveryDate || 'N/A'}</p>
                <p className="text-sm text-gray-400">Total Cost: {totalCost ? `₹${totalCost}` : 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-base font-medium mb-1 text-gray-400">Payment</h3>
                <p className="text-sm text-gray-400">Method: {paymentMethod || 'N/A'}</p>
                {paymentMethod === 'UPI' && <p className="text-sm text-gray-400">UPI ID: {upiId || 'N/A'}</p>}
                {paymentMethod === 'Card' && <p className="text-sm text-gray-400">Card: {cardNumber ? `**** **** **** ${cardNumber}` : 'N/A'}</p>}
              </div>
            </div>
            <div className="mt-4 flex gap-4 justify-center">
              <button
                onClick={() => navigate(`/track/${trackingId}`)}
                className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition text-sm"
              >
                Track Order
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition text-sm"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg border border-red-500 shadow-sm">
            <p className="text-red-500 text-sm text-center">Failed to confirm order. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinalConfirmation;