import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import PlaceOrder from './pages/PlaceOrder.jsx';
import TrackShipment from './pages/TrackShipment.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import FAQ from './pages/FAQ.jsx';
import Support from './pages/Support.jsx';
import PackageDetails from './pages/PackageDetails.jsx';
import SchedulePickup from './pages/SchedulePickup.jsx';
import DeliveryPreferences from './pages/DeliveryPreferences.jsx';
import PaymentGateway from './pages/PaymentGateway.jsx';
import FinalConfirmation from './pages/FinalConfirmation.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return <div>Loading...</div>;
  }
  return user ? children : <Navigate to="/login" state={{ from: window.location.pathname }} />;
}

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/track/:trackingId" element={<TrackShipment />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/support" element={<Support />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/place-order"
            element={
              <ProtectedRoute>
                <PlaceOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipment-details"
            element={
              <ProtectedRoute>
                <PackageDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirm-order"
            element={
              <ProtectedRoute>
                <SchedulePickup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-preferences"
            element={
              <ProtectedRoute>
                <DeliveryPreferences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-gateway"
            element={
              <ProtectedRoute>
                <PaymentGateway />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <ProtectedRoute>
                <FinalConfirmation />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;