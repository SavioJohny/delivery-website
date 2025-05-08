import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

function TrackShipment() {
  const { trackingId } = useParams();
  const location = useLocation();
  const [shipment, setShipment] = useState(location.state?.shipment || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!shipment);

  useEffect(() => {
    if (!shipment) {
      console.log('TrackShipment: Fetching for trackingId=', trackingId);
      const fetchShipment = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/shipments/track/${trackingId}`);
          console.log('TrackShipment: Response=', response.data);
          setShipment(response.data);
        } catch (err) {
          const errorMsg = err.response?.data?.message || err.message;
          console.error('TrackShipment: Error=', errorMsg);
          setError(`Failed to fetch shipment: ${errorMsg}`);
        } finally {
          setLoading(false);
        }
      };
      fetchShipment();
    }
  }, [trackingId, shipment]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-gray-400 font-inter flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-red-500 font-inter flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-gray-400 font-inter flex items-center justify-center">
        No shipment found
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Track Shipment</h2>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="space-y-2 text-gray-400">
            <p><strong className="text-white">Tracking ID:</strong> {shipment.trackingId}</p>
            <p><strong className="text-white">AWB Number:</strong> {shipment.awbNumber}</p>
            <p><strong className="text-white">Sender:</strong> {shipment.senderName}</p>
            <p><strong className="text-white">Receiver:</strong> {shipment.receiverName}</p>
            <p><strong className="text-white">Package Type:</strong> {shipment.packageType}</p>
            <p><strong className="text-white">Status:</strong> {shipment.status}</p>
          </div>
          <h3 className="text-xl font-semibold mt-6 text-yellow-400">Status History</h3>
          {shipment.statusHistory.length === 0 ? (
            <p className="text-gray-400 mt-2">No status updates available.</p>
          ) : (
            <ul className="list-disc pl-5 mt-2 text-gray-400">
              {shipment.statusHistory.map((entry, index) => (
                <li key={index} className="mb-1">
                  {entry.status} on {new Date(entry.timestamp).toLocaleString()}
                  {entry.location && ` at ${entry.location}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackShipment;