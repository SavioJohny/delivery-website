import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PaymentGateway() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
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
    deliveryDate,
    totalCost,
    trackingId
  } = state || {};
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Please log in to proceed with payment');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [token, navigate]);

  const handleUpiPayment = async () => {
    if (!token) {
      setError('Please log in to proceed');
      return;
    }
    if (!upiId.includes('@')) {
      setError('Please enter a valid UPI ID');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Order already submitted in DeliveryPreferences.jsx, navigate directly
      navigate('/order-confirmation', {
        state: {
          trackingId,
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
          deliveryDate,
          totalCost,
          paymentMethod: 'UPI',
          upiId
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  const handleCardPayment = async () => {
    if (!token) {
      setError('Please log in to proceed');
      return;
    }
    if (!/^\d{16}$/.test(cardNumber)) {
      setError('Please enter a valid 16-digit card number');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (!/^\d{3}$/.test(cvv)) {
      setError('Please enter a valid 3-digit CVV');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Order already submitted, navigate directly
      navigate('/order-confirmation', {
        state: {
          trackingId,
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
          deliveryDate,
          totalCost,
          paymentMethod: 'Card',
          cardNumber: cardNumber.slice(-4)
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Price Summary</h3>
            <div className="text-sm text-gray-400 space-y-2">
              <p><strong>Total Cost:</strong> ₹{totalCost || 'N/A'}</p>
              <p><strong>Delivery Type:</strong> {deliveryType || 'N/A'}</p>
              <p><strong>Time Slot:</strong> {deliveryPreferences?.timeSlot || 'N/A'}</p>
              <p><strong>Packaging:</strong> {deliveryPreferences?.packaging || 'N/A'}</p>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-yellow-400 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">Online Payment Guidelines</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>🔒 Ensure your connection is secure (look for HTTPS).</li>
              <li>💳 Use a trusted payment method and verify details before submitting.</li>
              <li>📧 You’ll receive a confirmation email with your tracking ID.</li>
              <li>🚫 Do not share your UPI ID, card details, or OTP with anyone.</li>
              <li>📞 Contact support if you encounter issues during payment.</li>
            </ul>
          </div>
        </div>
        <div className="md:w-2/3">
          <h2 className="text-3xl font-bold mb-6">Payment Gateway</h2>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Select Payment Method</h3>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setSelectedPaymentMethod('UPI')}
                className={`flex-1 p-2 rounded-lg font-semibold ${
                  selectedPaymentMethod === 'UPI'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!token}
              >
                UPI
              </button>
              <button
                onClick={() => setSelectedPaymentMethod('Cards')}
                className={`flex-1 p-2 rounded-lg font-semibold ${
                  selectedPaymentMethod === 'Cards'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!token}
              >
                Cards
              </button>
            </div>
            {selectedPaymentMethod === 'UPI' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-400">Pay with UPI ID / Number</h4>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter UPI ID (e.g., user@upi)"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  disabled={!token}
                />
                <button
                  onClick={handleUpiPayment}
                  disabled={isLoading || !token}
                  className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-black" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify and Pay'
                  )}
                </button>
              </div>
            )}
            {selectedPaymentMethod === 'Cards' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-400">Add a New Card</h4>
                <div className="space-y-2">
                  <label className="block text-gray-400">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="Enter 16-digit card number"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    maxLength="16"
                    disabled={!token}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400">MM/YY</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value.replace(/[^0-9/]/g, '').slice(0, 5))}
                      placeholder="MM/YY"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      maxLength="5"
                      disabled={!token}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="CVV"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      maxLength="3"
                      disabled={!token}
                    />
                  </div>
                </div>
                <button
                  onClick={handleCardPayment}
                  disabled={isLoading || !token}
                  className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-black" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Continue and Pay'
                  )}
                </button>
              </div>
            )}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentGateway;