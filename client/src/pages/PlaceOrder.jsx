import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

function PlaceOrder() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { pickupPin = '', deliveryPin = '' } = location.state || {};

  const indianStates = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
    'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const citiesByState = {
    'Andaman and Nicobar Islands': ['Port Blair', 'Car Nicobar', 'Mayabunder', 'Rangat'],
    'Andhra Pradesh': [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa',
      'Anantapur', 'Kakinada', 'Eluru', 'Ongole', 'Srikakulam', 'Vizianagaram', 'Machilipatnam'
    ],
    'Arunachal Pradesh': [
      'Itanagar', 'Naharlagun', 'Tawang', 'Pasighat', 'Ziro', 'Bomdila', 'Tezu', 'Aalo', 'Daporijo', 'Yingkiong'
    ],
    'Assam': [
      'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj',
      'Sivasagar', 'Goalpara', 'Barpeta', 'Dhubri', 'Lakhimpur', 'Hailakandi'
    ],
    'Bihar': [
      'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Arrah', 'Purnea', 'Katihar', 'Begusarai',
      'Bihar Sharif', 'Chapra', 'Hajipur', 'Motihari', 'Siwan', 'Samastipur'
    ],
    'Chandigarh': ['Chandigarh'],
    'Chhattisgarh': [
      'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Rajnandgaon',
      'Dhamtari', 'Mahasamund', 'Kanker', 'Narayanpur'
    ],
    'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Silvassa', 'Diu'],
    'Delhi': ['New Delhi', 'Delhi', 'Noida', 'Ghaziabad'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
    'Gujarat': [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh',
      'Anand', 'Bharuch', 'Nadiad', 'Mehsana', 'Gandhidham', 'Porbandar', 'Navsari'
    ],
    'Haryana': [
      'Faridabad', 'Gurgaon', 'Hisar', 'Panipat', 'Karnal', 'Rohtak', 'Sonipat', 'Yamunanagar', 'Ambala',
      'Bhiwani', 'Sirsa', 'Jind', 'Kurukshetra', 'Kaithal', 'Rewari'
    ],
    'Himachal Pradesh': [
      'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Hamirpur', 'Una', 'Bilaspur', 'Chamba', 'Kangra',
      'Nahan', 'Paonta Sahib'
    ],
    'Jammu and Kashmir': [
      'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Udhampur', 'Kathua', 'Pulwama', 'Kupwara',
      'Rajouri'
    ],
    'Jharkhand': [
      'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Giridih', 'Deoghar', 'Ramgarh', 'Phusro',
      'Medininagar', 'Chirkunda', 'Jhumri Telaiya'
    ],
    'Karnataka': [
      'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur',
      'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Udupi'
    ],
    'Kerala': [
      'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur',
      'Kottayam', 'Malappuram', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad'
    ],
    'Ladakh': ['Leh', 'Kargil'],
    'Lakshadweep': ['Kavaratti', 'Minicoy'],
    'Madhya Pradesh': [
      'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
      'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena'
    ],
    'Maharashtra': [
      'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati',
      'Navi Mumbai', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar'
    ],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching'],
    'Meghalaya': ['Shillong', 'Tura', 'Nongpoh', 'Jowai', 'Williamnagar'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto'],
    'Odisha': [
      'Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Berhampur', 'Puri', 'Balasore', 'Bhadrak',
      'Baripada', 'Jharsuguda', 'Jeypore', 'Angul', 'Dhenkanal', 'Keonjhar'
    ],
    'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    'Punjab': [
      'Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Mohali',
      'Pathankot', 'Moga', 'Firozpur', 'Kapurthala', 'Muktsar', 'Sangrur'
    ],
    'Rajasthan': [
      'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Sikar', 'Bharatpur',
      'Pali', 'Sri Ganganagar', 'Hanumangarh', 'Jhunjhunu', 'Churu'
    ],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
    'Tamil Nadu': [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore',
      'Thoothukudi', 'Dindigul', 'Thanjavur', 'Karur', 'Cuddalore', 'Kanchipuram', 'Nagercoil'
    ],
    'Telangana': [
      'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahbubnagar', 'Suryapet', 'Siddipet',
      'Adilabad', 'Nalgonda', 'Sangareddy', 'Medak', 'Rangareddy'
    ],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar', 'Belonia'],
    'Uttar Pradesh': [
      'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh',
      'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar'
    ],
    'Uttarakhand': [
      'Dehradun', 'Haridwar', 'Nainital', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh',
      'Pithoragarh', 'Almora', 'Mussoorie', 'Chamoli'
    ],
    'West Bengal': [
      'Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol', 'Bardhaman', 'Malda', 'Jalpaiguri',
      'Kharagpur', 'Darjeeling', 'Cooch Behar', 'Bankura', 'Purulia', 'Haldia', 'Berhampore'
    ]
  };

  const [pickupDetails, setPickupDetails] = useState({
    contactName: user?.name || '',
    mobile: user?.phone || '',
    email: user?.email || '',
    flat: '',
    area: '',
    state: '',
    city: '',
    pin: pickupPin,
  });
  const [deliveryDetails, setDeliveryDetails] = useState({
    contactName: '',
    mobile: '',
    email: '',
    flat: '',
    area: '',
    state: '',
    city: '',
    pin: deliveryPin,
  });
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location.pathname]);

  const handlePickupChange = (e) => {
    const { name, value } = e.target;
    setPickupDetails((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'state' ? { city: '' } : {})
    }));
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'state' ? { city: '' } : {})
    }));
  };

  const validateForm = () => {
    if (!pickupDetails.contactName) return 'Contact name is required for pickup address';
    if (!/^\d{10}$/.test(pickupDetails.mobile)) return 'Valid 10-digit mobile number required for pickup address';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pickupDetails.email)) return 'Valid email address required for pickup address';
    if (!pickupDetails.flat) return 'Flat/Housing details required for pickup address';
    if (!pickupDetails.area) return 'Area/Street details required for pickup address';
    if (!pickupDetails.state) return 'State required for pickup address';
    if (!pickupDetails.city) return 'City required for pickup address';
    if (!/^\d{6}$/.test(pickupDetails.pin)) return 'Valid 6-digit PIN code required for pickup address';

    if (!deliveryDetails.contactName) return 'Contact name is required for delivery address';
    if (!/^\d{10}$/.test(deliveryDetails.mobile)) return 'Valid 10-digit mobile number required for delivery address';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryDetails.email)) return 'Valid email address required for delivery address';
    if (!deliveryDetails.flat) return 'Flat/Housing details required for delivery address';
    if (!deliveryDetails.area) return 'Area/Street details required for delivery address';
    // State, city, and PIN are optional for delivery
    if (deliveryDetails.pin && !/^\d{6}$/.test(deliveryDetails.pin)) return 'Valid 6-digit PIN code required for delivery address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    const validationError = validateForm();
    if (validationError) {
      console.log('Validation Error:', validationError);
      setError(validationError);
      setFormLoading(false);
      return;
    }

    try {
      console.log('Navigating to /shipment-details with:', { pickup: pickupDetails, delivery: deliveryDetails });
      navigate('/shipment-details', {
        state: { pickup: pickupDetails, delivery: deliveryDetails }
      });
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Failed to proceed to shipment details. Please try again.');
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-white font-inter flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-yellow-400">Add Shipment Addresses</h2>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Things to Keep in Mind */}
          <div className="lg:w-1/3 bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">Things to Keep in Mind</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li>
                <strong>Package Weight</strong>
                <p>We only deliver packages up to 50kg.</p>
              </li>
              <li>
                <strong>Packaging</strong>
                <p>Please ensure items are packed for pickup by our delivery executive.</p>
              </li>
              <li>
                <strong>Restricted/Illegal Items</strong>
                <p>Do not include restricted or illegal items.</p>
              </li>
              <li>
                <strong>Multiple Packages</strong>
                <p>One box/package/parcel per order.</p>
              </li>
            </ul>
          </div>

          {/* Address Form */}
          <div className="lg:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Pickup Address */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-yellow-400">Pickup Address</h3>
                {/* Pickup Contact Details */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2 text-gray-300">Contact Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pickup-contactName" className="block mb-1 text-sm font-medium text-gray-300">
                        Contact Name
                      </label>
                      <input
                        id="pickup-contactName"
                        type="text"
                        name="contactName"
                        value={pickupDetails.contactName}
                        onChange={handlePickupChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="pickup-mobile" className="block mb-1 text-sm font-medium text-gray-300">
                        Mobile Number
                      </label>
                      <input
                        id="pickup-mobile"
                        type="text"
                        name="mobile"
                        value={pickupDetails.mobile}
                        onChange={handlePickupChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="pickup-email" className="block mb-1 text-sm font-medium text-gray-300">
                        Email Address
                      </label>
                      <input
                        id="pickup-email"
                        type="email"
                        name="email"
                        value={pickupDetails.email}
                        onChange={handlePickupChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Pickup Address Details */}
                <div>
                  <h4 className="text-lg font-medium mb-2 text-gray-300">Address Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="pickup-area" className="block mb-1 text-sm font-medium text-gray-300">
                        Area, Street, Sector
                      </label>
                      <input
                        id="pickup-area"
                        type="text"
                        name="area"
                        value={pickupDetails.area}
                        onChange={handlePickupChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="pickup-flat" className="block mb-1 text-sm font-medium text-gray-300">
                        Flat, Housing No., Building
                      </label>
                      <input
                        id="pickup-flat"
                        type="text"
                        name="flat"
                        value={pickupDetails.flat}
                        onChange={handlePickupChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pickup-state" className="block mb-1 text-sm font-medium text-gray-300">
                          State
                        </label>
                        <select
                          id="pickup-state"
                          name="state"
                          value={pickupDetails.state}
                          onChange={handlePickupChange}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          aria-required="true"
                          required
                        >
                          <option value="">Select State</option>
                          {indianStates.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="pickup-city" className="block mb-1 text-sm font-medium text-gray-300">
                          City
                        </label>
                        <select
                          id="pickup-city"
                          name="city"
                          value={pickupDetails.city}
                          onChange={handlePickupChange}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          aria-required="true"
                          required
                          disabled={!pickupDetails.state}
                        >
                          <option value="">Select City</option>
                          {pickupDetails.state &&
                            citiesByState[pickupDetails.state]?.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="pickup-pin" className="block mb-1 text-sm font-medium text-gray-300">
                        PIN Code
                      </label>
                      <input
                        id="pickup-pin"
                        type="text"
                        name="pin"
                        value={pickupDetails.pin}
                        onChange={handlePickupChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-yellow-400">Delivery Address</h3>
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2 text-gray-300">Contact Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="delivery-contactName" className="block mb-1 text-sm font-medium text-gray-300">
                        Contact Name
                      </label>
                      <input
                        id="delivery-contactName"
                        type="text"
                        name="contactName"
                        value={deliveryDetails.contactName}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="delivery-mobile" className="block mb-1 text-sm font-medium text-gray-300">
                        Mobile Number
                      </label>
                      <input
                        id="delivery-mobile"
                        type="text"
                        name="mobile"
                        value={deliveryDetails.mobile}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="delivery-email" className="block mb-1 text-sm font-medium text-gray-300">
                        Email Address
                      </label>
                      <input
                        id="delivery-email"
                        type="email"
                        name="email"
                        value={deliveryDetails.email}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2 text-gray-300">Address Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="delivery-area" className="block mb-1 text-sm font-medium text-gray-300">
                        Area, Street, Sector
                      </label>
                      <input
                        id="delivery-area"
                        type="text"
                        name="area"
                        value={deliveryDetails.area}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="delivery-flat" className="block mb-1 text-sm font-medium text-gray-300">
                        Flat, Housing No., Building
                      </label>
                      <input
                        id="delivery-flat"
                        type="text"
                        name="flat"
                        value={deliveryDetails.flat}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="delivery-state" className="block mb-1 text-sm font-medium text-gray-300">
                          State
                        </label>
                        <select
                          id="delivery-state"
                          name="state"
                          value={deliveryDetails.state}
                          onChange={handleDeliveryChange}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="">Select State</option>
                          {indianStates.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="delivery-city" className="block mb-1 text-sm font-medium text-gray-300">
                          City
                        </label>
                        <select
                          id="delivery-city"
                          name="city"
                          value={deliveryDetails.city}
                          onChange={handleDeliveryChange}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          disabled={!deliveryDetails.state}
                        >
                          <option value="">Select City</option>
                          {deliveryDetails.state &&
                            citiesByState[deliveryDetails.state]?.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="delivery-pin" className="block mb-1 text-sm font-medium text-gray-300">
                        PIN Code
                      </label>
                      <input
                        id="delivery-pin"
                        type="text"
                        name="pin"
                        value={deliveryDetails.pin}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {formLoading ? 'Processing...' : 'Next'}
              </button>
            </form>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrder;