import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext.jsx';

// Set Axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

function Support() {
  const [view, setView] = useState('tickets');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isChatClosed, setIsChatClosed] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Please log in to access support');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const fetchTickets = async () => {
      try {
        const config = {
          headers: { 'x-auth-token': token },
        };
        console.log('Fetching tickets with token:', token);
        const res = await axios.get('/api/support', config);
        setTickets(res.data);
        setError('');
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError(err.response?.data?.msg || 'Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.response?.data?.msg || 'Failed to fetch tickets');
          console.error('Fetch tickets error:', err.response?.data || err);
        }
      }
    };

    if (view === 'tickets') fetchTickets();
  }, [token, view, navigate]);

  useEffect(() => {
    if (!token || view !== 'chat' || !user) return;

    socketRef.current = io('http://localhost:5000', {
      query: { token },
    });

    socketRef.current.on('connect', () => {
      console.log('Socket.IO: Connected, joining chat:', user._id);
      socketRef.current.emit('joinChat', user._id);
    });

    socketRef.current.on('message', (message) => {
      console.log('Socket.IO: Received message:', message);
      setChatMessages((prev) => {
        const isDuplicate = prev.some(
          (msg) =>
            msg.message === message.message &&
            Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000
        );
        if (!isDuplicate) {
          return [...prev, message];
        }
        return prev;
      });
    });

    socketRef.current.on('chatHistory', (history) => {
      console.log('Socket.IO: Received chatHistory:', history);
      setChatMessages(history);
      setIsChatClosed(false);
    });

    socketRef.current.on('chatClosed', () => {
      console.log('Socket.IO: Chat closed');
      setIsChatClosed(true);
      setError('Chat has been closed by admin');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO: Connection error:', err.message);
      setError(`Failed to connect to live chat: ${err.message}`);
      if (err.message.includes('Authentication')) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket.IO: Disconnected');
      }
    };
  }, [token, view, user, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in to submit a ticket');
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }
    setIsSending(true);
    try {
      const config = {
        headers: { 'x-auth-token': token },
      };
      console.log('Submitting ticket with token:', token);
      const res = await axios.post('/api/support', { subject, message }, config);
      setTickets([...tickets, res.data.ticket]);
      setError('');
      alert('Support ticket submitted successfully!');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Submit ticket error:', err.response?.data, err.response?.status, err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.response?.data?.msg || 'Session expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.msg || 'Failed to submit ticket');
        alert(err.response?.data?.msg || 'Failed to submit ticket');
      }
    } finally {
      setIsSending(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in to send a message');
      return;
    }
    if (!newChatMessage.trim() || isChatClosed) {
      setError('Cannot send empty message or chat is closed');
      return;
    }

    const message = {
      user: user._id,
      message: newChatMessage.trim(),
      sender: 'user',
      createdAt: new Date(),
    };
    console.log('Socket.IO: Sending message:', message);
    try {
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', message);
        setNewChatMessage('');
        setError('');
      }
    } catch (err) {
      console.error('Socket.IO: Send message error:', err);
      setError('Failed to send message');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-white font-inter flex items-center justify-center">
        <p className="text-red-500">Please log in to access support.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-inter py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Support</h2>
        <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setView('tickets')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              view === 'tickets'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            aria-label="View support tickets"
          >
            Tickets
          </button>
          <button
            onClick={() => setView('chat')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              view === 'chat'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            aria-label="View live chat"
          >
            Live Chat
          </button>
        </div>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {view === 'tickets' && (
          <>
            <form onSubmit={handleTicketSubmit} className="space-y-4 mb-8">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                aria-label="Ticket subject"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-32"
                required
                aria-label="Ticket message"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={isSending}
                aria-label="Submit support ticket"
              >
                {isSending ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">Your Tickets</h3>
            {tickets.length === 0 ? (
              <p className="text-gray-400">No tickets submitted yet.</p>
            ) : (
              <div className="space-y-6">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-sm">
                    <p className="text-gray-400"><strong>Subject:</strong> {ticket.subject}</p>
                    <p className="text-gray-400"><strong>Status:</strong> {ticket.status}</p>
                    <p className="text-gray-400"><strong>Initial Message:</strong> {ticket.message}</p>
                    {ticket.replies && ticket.replies.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-400"><strong>Replies:</strong></p>
                        <div className="space-y-2">
                          {ticket.replies.map((reply, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded-lg max-w-[70%] ${
                                reply.sender === 'admin' ? 'bg-gray-600 ml-auto' : 'bg-gray-700'
                              }`}
                            >
                              <p className="text-white">
                                <strong>{reply.sender === 'admin' ? 'Admin' : 'You'}:</strong>{' '}
                                {reply.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(reply.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {view === 'chat' && (
          <>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-96 overflow-y-auto mb-4 shadow-sm">
              {chatMessages.length === 0 ? (
                <p className="text-gray-400">No messages yet. Start the conversation!</p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded-lg max-w-[70%] ${
                      msg.sender === 'user' ? 'bg-gray-700' : 'bg-gray-600 ml-auto'
                    }`}
                  >
                    <p className="text-white">
                      <strong>{msg.sender === 'user' ? 'You' : 'Admin'}:</strong> {msg.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            {isChatClosed ? (
              <p className="text-red-500 text-center">Chat has been closed by admin.</p>
            ) : (
              <form onSubmit={sendChatMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  disabled={isChatClosed || !token}
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={isChatClosed || !token}
                  aria-label="Send chat message"
                >
                  Send
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Support;