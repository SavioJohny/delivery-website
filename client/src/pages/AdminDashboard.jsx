import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext.jsx';

function AdminDashboard() {
  const [shipments, setShipments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [replyMessages, setReplyMessages] = useState({});
  const [supportView, setSupportView] = useState('tickets');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [view, setView] = useState('shipments');
  const [ticketError, setTicketError] = useState('');
  const [chatError, setChatError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const config = {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        };
        const [shipmentsRes, ticketsRes, usersRes] = await Promise.all([
          axios.get('/api/shipments', config),
          axios.get('/api/support/admin', config),
          axios.get('/api/chat/admin', config),
        ]);
        setShipments(shipmentsRes.data);
        setTickets(ticketsRes.data);
        setUsers(usersRes.data);
        setTicketError('');
      } catch (err) {
        setTicketError(err.response?.data?.msg || 'Failed to fetch data');
        console.error('AdminDashboard.jsx: Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    socketRef.current = io('http://localhost:5000', {
      query: { token: localStorage.getItem('token') },
    });

    socketRef.current.on('connect', () => {
      console.log('Socket.IO: Admin connected');
      if (selectedUser) {
        socketRef.current.emit('joinChat', selectedUser._id);
        console.log('Socket.IO: Admin joined chat:', selectedUser._id);
      }
    });

    socketRef.current.on('message', (message) => {
      console.log('Socket.IO: Admin received message:', message);
      if (message.user === selectedUser?._id) {
        const correctedMessage = {
          ...message,
          sender: message.sender === 'admin' ? 'admin' : 'user',
          pending: false,
        };
        setChatMessages((prev) => {
          if (message.clientMessageId && prev.some((msg) => msg.clientMessageId === message.clientMessageId)) {
            return prev;
          }
          return [...prev, correctedMessage];
        });
      }
    });

    socketRef.current.on('chatHistory', (history) => {
      console.log('Socket.IO: Admin received chatHistory:', history);
      const correctedHistory = history.map((msg) => ({
        ...msg,
        sender: msg.sender === 'admin' ? 'admin' : 'user',
        pending: false,
      }));
      setChatMessages(correctedHistory);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket.IO: Server error:', error.message);
      setChatError(error.message);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO: Admin connection error:', err.message);
      setChatError(`Failed to connect to live chat: ${err.message}`);
    });

    socketRef.current.on('shipmentUpdate', (shipment) => {
      setShipments((prev) =>
        prev.map((s) => (s._id === shipment._id ? { ...s, ...shipment } : s))
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket.IO: Admin disconnected');
      }
    };
  }, [user]);

  useEffect(() => {
    if (selectedUser && socketRef.current?.connected) {
      socketRef.current.emit('joinChat', selectedUser._id);
      console.log('Socket.IO: Admin joined chat:', selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const updateStatus = async (id, status) => {
    setIsLoading(true);
    try {
      const config = {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      };
      const response = await axios.put(`/api/shipments/${id}/status`, { status }, config);
      setShipments(shipments.map((shipment) => (shipment._id === id ? response.data : shipment)));
      setTicketError('');
    } catch (err) {
      setTicketError(err.response?.data?.msg || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (ticketId) => {
    const message = replyMessages[ticketId]?.trim();
    if (!message) {
      setTicketError('Please enter a reply');
      return;
    }
    setIsLoading(true);
    try {
      const config = {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      };
      await axios.post(`/api/support/reply/${ticketId}`, { message }, config);
      const ticketsRes = await axios.get('/api/support/admin', config);
      setTickets(ticketsRes.data);
      setReplyMessages({ ...replyMessages, [ticketId]: '' });
      setTicketError('');
      alert('Reply sent successfully');
    } catch (err) {
      setTicketError(err.response?.data?.msg || 'Failed to send reply');
      alert(err.response?.data?.msg || 'Failed to send reply');
    } finally {
      setIsLoading(false);
    }
  };

  const closeTicket = async (ticketId) => {
    setIsLoading(true);
    try {
      const config = {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      };
      await axios.put(`/api/support/close/${ticketId}`, {}, config);
      const ticketsRes = await axios.get('/api/support/admin', config);
      setTickets(ticketsRes.data);
      setTicketError('');
      alert('Ticket closed successfully');
    } catch (err) {
      setTicketError(err.response?.data?.msg || 'Failed to close ticket');
      alert(err.response?.data?.msg || 'Failed to close ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !selectedUser || isSending) {
      setChatError('Cannot send empty message or no user selected');
      return;
    }

    setIsSending(true);
    const message = {
      user: selectedUser._id,
      message: newChatMessage.trim(),
      sender: 'admin',
      createdAt: new Date(),
      pending: false,
      clientMessageId: crypto.randomUUID(),
    };
    console.log('Socket.IO: Admin sending message:', message);
    try {
      if (socketRef.current) {
        setChatMessages((prev) => [...prev, message]);
        socketRef.current.emit('sendMessage', message);
        setNewChatMessage('');
        setChatError('');
      }
    } catch (err) {
      console.error('Socket.IO: Admin send message error:', err);
      setChatError('Failed to send message');
      setChatMessages((prev) => prev.filter((msg) => msg.clientMessageId !== message.clientMessageId));
    } finally {
      setIsSending(false);
    }
  };

  const closeChat = () => {
    if (!selectedUser) return;
    socketRef.current.emit('closeChat', selectedUser._id);
    setSelectedUser(null);
    setChatMessages([]);
    setChatError('');
    console.log('Socket.IO: Admin closed chat:', selectedUser._id);
  };

  // Helper function to safely format the date
  const formatDate = (shipment) => {
    const date = shipment.orderDate || shipment.createdAt; // Fallback to createdAt if orderDate is missing
    if (!date) return 'N/A';
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return 'Invalid Date';
      return parsedDate.toLocaleDateString();
    } catch (err) {
      console.error('Error parsing date:', date, err);
      return 'Invalid Date';
    }
  };

  if (!user || user.role !== 'admin') return <p className="text-center text-red-500">Access denied.</p>;

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

        {/* Toggle Shipments/Support */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setView('shipments')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              view === 'shipments'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            } transition`}
          >
            Shipments
          </button>
          <button
            onClick={() => setView('support')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              view === 'support'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            } transition`}
          >
            Support
          </button>
        </div>

        {ticketError && <p className="text-red-500 mb-4">{ticketError}</p>}
        {chatError && <p className="text-red-500 mb-4">{chatError}</p>}
        {isLoading && <p className="text-gray-400 mb-4">Loading...</p>}

        {/* Shipments View */}
        {view === 'shipments' && (
          <>
            <h3 className="text-xl font-semibold mb-4">Shipments</h3>
            {shipments.length === 0 ? (
              <p className="text-gray-400">No shipments available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-700">
                  <thead>
                    <tr className="bg-gray-800 text-gray-400">
                      <th className="p-3 text-left">Tracking ID</th>
                      <th className="p-3 text-left">Sender</th>
                      <th className="p-3 text-left">Receiver</th>
                      <th className="p-3 text-left">Package Type</th>
                      <th className="p-3 text-left">Weight</th>
                      <th className="p-3 text-left">Order Date</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((shipment) => (
                      <tr key={shipment._id} className="border-t border-gray-700 bg-gray-800">
                        <td className="p-3">
                          <Link to={`/track/${shipment.trackingId}`} className="text-yellow-400 hover:underline">
                            {shipment.trackingId}
                          </Link>
                        </td>
                        <td className="p-3">
                          {shipment.senderName}
                          <br />
                          <span className="text-gray-500 text-xs">{shipment.senderAddress}</span>
                        </td>
                        <td className="p-3">
                          {shipment.receiverName}
                          <br />
                          <span className="text-gray-500 text-xs">{shipment.receiverAddress}</span>
                        </td>
                        <td className="p-3">{shipment.packageType}</td>
                        <td className="p-3">{shipment.packageWeight} kg</td>
                        <td className="p-3">{formatDate(shipment)}</td>
                        <td className="p-3">
                          <span
                            className={`font-semibold ${
                              shipment.status === 'delivered'
                                ? 'text-green-500'
                                : shipment.status === 'failed'
                                ? 'text-red-500'
                                : 'text-yellow-400'
                            }`}
                          >
                            {shipment.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            onChange={(e) => updateStatus(shipment._id, e.target.value)}
                            value={shipment.status}
                            className="p-1 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            disabled={isLoading}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Support View */}
        {view === 'support' && (
          <>
            <h3 className="text-xl font-semibold mb-4">Support</h3>
            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => setSupportView('tickets')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  supportView === 'tickets'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                } transition`}
              >
                Tickets
              </button>
              <button
                onClick={() => setSupportView('chat')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  supportView === 'chat'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                } transition`}
              >
                Live Chat
              </button>
            </div>

            {/* Tickets */}
            {supportView === 'tickets' && (
              <>
                {isLoading && <p className="text-gray-400 mb-4">Loading tickets...</p>}
                {tickets.length === 0 ? (
                  <p className="text-gray-400">No support tickets available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-700">
                      <thead>
                        <tr className="bg-gray-800 text-gray-400">
                          <th className="p-3 text-left">Subject</th>
                          <th className="p-3 text-left">User</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Message</th>
                          <th className="p-3 text-left">Replies</th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => (
                          <tr key={ticket._id} className="border-t border-gray-700 bg-gray-800">
                            <td className="p-3">{ticket.subject}</td>
                            <td className="p-3">{ticket.user?.name || 'Guest'}</td>
                            <td className="p-3">{ticket.status}</td>
                            <td className="p-3">{ticket.message}</td>
                            <td className="p-3">
                              {ticket.replies && ticket.replies.length > 0 ? (
                                <ul className="list-disc pl-4">
                                  {ticket.replies.map((reply, index) => (
                                    <li key={index}>
                                      <strong>{reply.sender === 'admin' ? 'Admin' : 'User'}:</strong>{' '}
                                      {reply.message}
                                      <span className="text-sm text-gray-500">
                                        {' '}
                                        ({new Date(reply.createdAt).toLocaleString()})
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                'No replies'
                              )}
                            </td>
                            <td className="p-3 space-y-2">
                              {ticket.status !== 'closed' && (
                                <>
                                  <textarea
                                    value={replyMessages[ticket._id] || ''}
                                    onChange={(e) =>
                                      setReplyMessages({
                                        ...replyMessages,
                                        [ticket._id]: e.target.value,
                                      })
                                    }
                                    placeholder="Type your reply"
                                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    disabled={isLoading}
                                  />
                                  <button
                                    onClick={() => handleReply(ticket._id)}
                                    className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
                                    disabled={isLoading}
                                  >
                                    {isLoading ? 'Sending...' : 'Send Reply'}
                                  </button>
                                  <button
                                    onClick={() => closeTicket(ticket._id)}
                                    className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                                    disabled={isLoading}
                                  >
                                    {isLoading ? 'Closing...' : 'Close Ticket'}
                                  </button>
                                </>
                              )}
                              {ticket.status === 'closed' && (
                                <p className="text-gray-400 text-sm">Ticket Closed</p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Chat */}
            {supportView === 'chat' && (
              <div className="flex">
                <div className="w-1/4 border-r border-gray-700 pr-4">
                  <h4 className="font-semibold mb-2 text-white">Users</h4>
                  {users.length === 0 ? (
                    <p className="text-gray-400">No active chats.</p>
                  ) : (
                    <ul>
                      {users.map((u) => (
                        <li
                          key={u._id}
                          onClick={() => setSelectedUser(u)}
                          className={`p-2 cursor-pointer rounded-lg ${
                            selectedUser?._id === u._id ? 'bg-gray-700' : 'hover:bg-gray-600'
                          } text-white`}
                        >
                          {u.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="w-3/4 pl-4">
                  {chatError && <p className="text-red-500 mb-4">{chatError}</p>}
                  {selectedUser ? (
                    <>
                      <h4 className="font-semibold mb-2 text-white">Chatting with {selectedUser.name}</h4>
                      <div className="border border-gray-700 rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-800">
                        {chatMessages.length === 0 ? (
                          <p className="text-gray-400">No messages yet.</p>
                        ) : (
                          chatMessages.map((msg, index) => (
                            <div
                              key={msg.clientMessageId || index}
                              className={`mb-2 p-2 rounded-lg ${
                                msg.sender === 'admin' ? 'bg-yellow-400 text-black ml-auto' : 'bg-gray-700 text-white'
                              } max-w-[70%] ${isSending && msg.clientMessageId ? 'opacity-75 italic' : ''}`}
                            >
                              <p>
                                <strong>
                                  {msg.sender === 'admin' ? 'You' : selectedUser.name}:
                                </strong>{' '}
                                {msg.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          ))
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={sendChatMessage} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={newChatMessage}
                          onChange={(e) => setNewChatMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          disabled={isSending}
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
                          disabled={isSending}
                        >
                          {isSending ? 'Sending...' : 'Send'}
                        </button>
                      </form>
                      <button
                        onClick={closeChat}
                        className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                        disabled={isSending}
                      >
                        Close Chat
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-400">Select a user to start chatting.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;