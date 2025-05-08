import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PackageDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { pickup, delivery } = state || {};
  const [showPickupDetails, setShowPickupDetails] = useState(false);
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [packaging, setPackaging] = useState('');
  const [otherPackaging, setOtherPackaging] = useState('');
  const [dimensions, setDimensions] = useState({ length: '', breadth: '', height: '' });
  const [unit, setUnit] = useState('cm');
  const [weight, setWeight] = useState('');
  const [contents, setContents] = useState([]);
  const [otherContents, setOtherContents] = useState('');
  const [packageValue, setPackageValue] = useState('');
  const [error, setError] = useState('');

  const packagingOptions = ['Envelope/Pouch', 'Box/Carton', 'Suitcase/Luggage', 'Backpack/Hand Bag', 'Other'];
  const contentOptions = [
    'Books & Documents', 'Clothes & Personal Items', 'Consumables', 'Electronics',
    'Household Items', 'Sports Equipment', 'Others'
  ];

  const handlePackagingNext = () => {
    if (!packaging) {
      setError('Please select a packaging type');
      return;
    }
    if (packaging === 'Other' && !otherPackaging.trim()) {
      setError('Please specify the packaging content');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleWeightNext = () => {
    if (!dimensions.length || !dimensions.breadth || !dimensions.height) {
      setError('Please enter all package dimensions');
      return;
    }
    if (isNaN(weight) || weight <= 0 || weight > 50) {
      setError('Please enter a valid weight up to 50kg');
      return;
    }
    setError('');
    setCurrentStep(3);
  };

  const handleContentNext = () => {
    if (!contents.length) {
      setError('Please select at least one package content');
      return;
    }
    if (contents.includes('Others') && !otherContents.trim()) {
      setError('Please specify other package contents');
      return;
    }
    setError('');
    setCurrentStep(4);
  };

  const handleFinalNext = () => {
    if (!packageValue || isNaN(packageValue) || packageValue <= 0) {
      setError('Please enter a valid package value in INR');
      return;
    }
    setError('');
    navigate('/confirm-order', {
      state: {
        pickup,
        delivery,
        packaging: packaging === 'Other' ? otherPackaging : packaging,
        dimensions: { ...dimensions, unit },
        weight,
        contents: contents.includes('Others') ? [...contents.filter(c => c !== 'Others'), otherContents] : contents,
        packageValue
      }
    });
  };

  const handlePrevious = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const toggleUnit = () => {
    setUnit(unit === 'cm' ? 'inches' : 'cm');
  };

  const handleContentChange = (content) => {
    if (contents.includes(content)) {
      setContents(contents.filter(c => c !== content));
    } else {
      setContents([...contents, content]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6">
        {/* Address Details (Left Side) */}
        <div className="md:w-1/3 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Address Details</h3>
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

        {/* Main Section (Right Side) */}
        <div className="md:w-2/3">
          <h2 className="text-3xl font-bold mb-6">Package Details</h2>
          <div className="space-y-6">
            {/* Step 1: Select Packaging */}
            {currentStep === 1 && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Select Packaging</h3>
                <select
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
                >
                  <option value="" className="text-gray-500">Select Packaging</option>
                  {packagingOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {packaging === 'Other' && (
                  <textarea
                    value={otherPackaging}
                    onChange={(e) => setOtherPackaging(e.target.value)}
                    placeholder="Specify packaging content"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
                    rows="4"
                  />
                )}
                <button
                  onClick={handlePackagingNext}
                  className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
                >
                  Next
                </button>
              </div>
            )}

            {/* Step 2: Choose Parcel Weight */}
            {currentStep === 2 && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Choose Parcel Weight</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-gray-400">Package Dimensions ({unit})</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-1 text-gray-400">Length</label>
                        <input
                          type="number"
                          value={dimensions.length}
                          onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-gray-400">Breadth</label>
                        <input
                          type="number"
                          value={dimensions.breadth}
                          onChange={(e) => setDimensions({ ...dimensions, breadth: e.target.value })}
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-gray-400">Height</label>
                        <input
                          type="number"
                          value={dimensions.height}
                          onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleUnit}
                    className="px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition"
                  >
                    Switch to {unit === 'cm' ? 'inches' : 'cm'}
                  </button>
                  <div>
                    <label className="block mb-1 text-gray-400">Enter Package Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={handlePrevious}
                    className="w-1/2 px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleWeightNext}
                    className="w-1/2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Choose Package Content */}
            {currentStep === 3 && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Choose Package Content</h3>
                <div className="space-y-2">
                  {contentOptions.map((option) => (
                    <label key={option} className="flex items-center text-gray-400">
                      <input
                        type="checkbox"
                        checked={contents.includes(option)}
                        onChange={() => handleContentChange(option)}
                        className="mr-2 accent-yellow-400"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {contents.includes('Others') && (
                  <textarea
                    value={otherContents}
                    onChange={(e) => setOtherContents(e.target.value)}
                    placeholder="Specify other contents"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 mt-4"
                    rows="4"
                  />
                )}
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={handlePrevious}
                    className="w-1/2 px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleContentNext}
                    className="w-1/2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Customer Protect */}
            {currentStep === 4 && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Customer Protect</h3>
                <p className="text-red-500 mb-4">
                  Please pack your electronics in original manufacturer packaging. Electronics will be covered only if shipped using the original manufacturer packaging box and filler protection.
                </p>
                <div>
                  <label className="block mb-1 text-gray-400">Package Value (INR)</label>
                  <input
                    type="number"
                    value={packageValue}
                    onChange={(e) => setPackageValue(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    min="0"
                  />
                </div>
                <div className="mt-4">
                  <button
                    onClick={handlePrevious}
                    className="w-full px-4 py-2 bg-gray-700 text-gray-400 font-semibold rounded-lg hover:bg-gray-600 transition"
                  >
                    Previous
                  </button>
                </div>
              </div>
            )}

            {/* Final Next Button */}
            {currentStep === 4 && (
              <button
                onClick={handleFinalNext}
                className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition mt-4"
              >
                Next
              </button>
            )}
          </div>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default PackageDetails;