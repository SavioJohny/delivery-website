import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Shipment from './models/Shipment.js';
import User from './models/User.js';
import ChatMessage from './models/ChatMessage.js';
import authRoutes from './routes/auth.js';
import supportRoutes from './routes/support.js';
import chatRoutes from './routes/chat.js';

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
  },
});

connectDB();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.path}`);
  next();
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ phone: identifier }, { email: identifier }] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ user: { _id: user._id, role: user.role || 'user' } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mobile Login endpoint
app.post('/api/auth/mobile-login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ user: { _id: user._id, role: user.role || 'user' } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Mobile login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  const { phone, email, password } = req.body;
  try {
    if (!phone || !email || !password) {
      return res.status(400).json({ message: 'Phone, email, and password are required' });
    }
    let user = await User.findOne({ $or: [{ phone }, { email }] });
    if (user) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      phone,
      email,
      password: hashedPassword,
      role: 'user',
    });
    await user.save();
    const token = jwt.sign({ user: { _id: user._id, role: 'user' } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile endpoints
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ _id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const { name, phone, email } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = name !== undefined ? name : user.name;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    await user.save();
    res.json({ _id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Phone or email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
app.post('/api/users/reset-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
app.delete('/api/users/delete', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    await Shipment.deleteMany({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Orders endpoint
app.get('/api/shipments/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const toMe = await Shipment.find({ receiver: userId });
    const fromMe = await Shipment.find({ sender: userId });
    res.json({ toMe, fromMe });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Queries endpoint
app.get('/api/queries', authenticateToken, async (req, res) => {
  try {
    const chats = await ChatMessage.find({ user: req.user._id }).distinct('user');
    res.json(chats.map(chat => ({ type: 'Chat', status: 'Open', details: 'Live chat session' })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save order endpoint
app.post('/api/orders', authenticateToken, async (req, res) => {
  const {
    pickup,
    delivery,
    weight,
    deliveryType,
    packaging,
    dimensions,
    contents,
    packageValue,
    pickupDate
  } = req.body;

  try {
    // Validate pickup address
    if (!pickup || !pickup.flat || !pickup.area || !pickup.city || !pickup.state || !pickup.pin || !/^\d{6}$/.test(pickup.pin)) {
      return res.status(400).json({ message: 'Complete pickup address with 6-digit PIN required' });
    }
    // Validate delivery address (minimal requirements)
    if (!delivery || !delivery.flat || !delivery.area) {
      return res.status(400).json({ message: 'Delivery flat and area required' });
    }
    if (!weight || !deliveryType) {
      return res.status(400).json({ message: 'Weight and delivery type required' });
    }

    // Create or find users
    let sender = await User.findOne({ phone: pickup.mobile });
    if (!sender) {
      sender = new User({
        phone: pickup.mobile,
        email: pickup.email || `${pickup.mobile}@example.com`,
        password: await bcrypt.hash(pickup.mobile, 10),
        role: 'user',
      });
      await sender.save();
    }
    let receiver = await User.findOne({ phone: delivery.mobile });
    if (!receiver) {
      receiver = new User({
        phone: delivery.mobile,
        email: delivery.email || `${delivery.mobile}@example.com`,
        password: await bcrypt.hash(delivery.mobile, 10),
        role: 'user',
      });
      await receiver.save();
    }

    const packageType = deliveryType === 'EXPRESS' ? 'express' : 'standard';
    const senderAddress = `${pickup.flat}, ${pickup.area}, ${pickup.city}, ${pickup.state}, ${pickup.pin}`;
    const receiverAddressParts = [
      delivery.flat,
      delivery.area,
      delivery.city || '',
      delivery.state || '',
      delivery.pin || ''
    ].filter(part => part).join(', ');
    const trackingId = `TRK-${Math.floor(Math.random() * 1000000)}`;
    const awbNumber = `AWB-${Math.floor(Math.random() * 1000000)}`;

    const shipment = new Shipment({
      user: req.user._id,
      sender: sender._id,
      receiver: receiver._id,
      trackingId,
      senderName: pickup.contactName || sender.phone,
      senderAddress,
      receiverName: delivery.contactName || receiver.phone,
      receiverAddress: receiverAddressParts,
      packageWeight: weight,
      packageType,
      status: 'pending',
      awbNumber,
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
      additionalDetails: {
        phoneNumbers: [pickup.mobile, delivery.mobile],
        packaging,
        dimensions,
        contents,
        packageValue,
        pickupDate
      }
    });

    await shipment.save();
    io.emit('shipmentUpdate', shipment);
    console.log(`Order saved: Tracking ID ${trackingId} for user ${req.user._id}`);
    res.status(201).json({ trackingId });
  } catch (err) {
    console.error('Order creation error:', err.stack);
    res.status(500).json({ message: 'Error saving order', error: err.message });
  }
});

// Existing endpoints
app.use('/api/auth', authRoutes);
app.use('/api/support', authenticateToken, supportRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/shipments', (req, res, next) => {
  console.log('Shipment route hit:', req.method, req.path);
  next();
});

app.post('/api/shipments/create', async (req, res) => {
  const { user, senderName, senderAddress, receiverName, receiverAddress, packageWeight, packageType, status } = req.body;
  const token = req.headers['x-auth-token'];

  try {
    console.log('Request body:', req.body);
    if (!senderName || !senderAddress || !receiverName || !receiverAddress || !packageWeight || !packageType) {
      return res.status(400).json({ message: 'All shipment details are required' });
    }
    if (!['standard', 'express', 'fragile'].includes(packageType)) {
      return res.status(400).json({ message: 'Invalid package type' });
    }
    if (isNaN(packageWeight) || packageWeight <= 0) {
      return res.status(400).json({ message: 'Invalid package weight' });
    }

    let decodedUser = null;
    if (token && user) {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      if (decodedUser.user._id !== user.toString()) {
        return res.status(403).json({ message: 'Unauthorized user' });
      }
    }

    const shipment = new Shipment({
      user: user || null,
      trackingId: `TRK-${Math.floor(Math.random() * 1000000)}`,
      senderName,
      senderAddress,
      receiverName,
      receiverAddress,
      packageWeight,
      packageType,
      status: status || 'pending',
      awbNumber: `AWB-${Math.floor(Math.random() * 1000000)}`,
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    });

    await shipment.save();
    io.emit('shipmentUpdate', shipment);
    console.log(`Shipment created: AWB ${shipment.awbNumber} for user ${user || 'Guest'}`);
    res.status(201).json(shipment);
  } catch (err) {
    console.error('Shipment creation error:', err.stack);
    res.status(500).json({ message: 'Error creating shipment', error: err.message });
  }
});

app.get('/api/shipments', authenticateToken, async (req, res) => {
  try {
    const shipments = await Shipment.find(req.user.role === 'admin' ? {} : { user: req.user._id });
    if (!shipments.length) {
      return res.status(404).json({ message: 'No shipments found' });
    }
    res.json(shipments);
  } catch (err) {
    console.error('Error fetching shipments:', err.stack);
    res.status(500).json({ message: 'Server error while fetching shipments', error: err.message });
  }
});

app.put('/api/shipments/:id/status', authenticateToken, async (req, res) => {
  const { status, location } = req.body;
  try {
    if (!['pending', 'in-transit', 'delivered', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    shipment.status = status;
    shipment.statusHistory.push({ status, location: location || '', timestamp: new Date() });
    await shipment.save();
    io.emit('shipmentUpdate', shipment);
    res.json(shipment);
  } catch (err) {
    console.error('Status update error:', err.stack);
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

app.get('/api/shipments/track/:trackingId', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.json(shipment);
  } catch (err) {
    console.error('Error tracking shipment:', err.stack);
    res.status(500).json({ message: 'Error tracking shipment', error: err.message });
  }
});

// Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  console.log('Socket.IO: Handshake token:', token);
  if (!token) {
    console.log('Socket.IO: No token provided');
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.user || !decoded.user._id) {
      console.log('Socket.IO: Invalid token structure');
      return next(new Error('Authentication error: Invalid token structure'));
    }
    socket.user = decoded.user;
    console.log('Socket.IO: Authenticated user:', socket.user._id);
    next();
  } catch (err) {
    console.error('Socket.IO: Token verification error:', err.message);
    return next(new Error(`Authentication error: ${err.message}`));
  }
});

const activeChats = {};

io.on('connection', (socket) => {
  console.log('Socket.IO: New connection:', socket.id, 'User:', socket.user._id);
  const userId = socket.user._id;
  const isAdmin = socket.user.role === 'admin';

  socket.on('joinChat', async (chatUserId) => {
    console.log('Socket.IO: joinChat:', chatUserId, 'by:', userId, 'isAdmin:', isAdmin);
    const targetUserId = isAdmin ? chatUserId : userId;
    socket.join(targetUserId);
    console.log(`Socket.IO: ${userId} joined room: ${targetUserId}`);

    if (!isAdmin) {
      activeChats[targetUserId] = true;
      io.emit('userStatus', { userId: targetUserId, status: 'online' });
      console.log('Socket.IO: User status updated: online', targetUserId);
    }

    try {
      const history = await ChatMessage.find({ user: targetUserId }).sort({ createdAt: 1 });
      socket.emit('chatHistory', history);
      console.log('Socket.IO: Sent chatHistory to:', targetUserId, 'Messages:', history.length);
    } catch (err) {
      console.error('Socket.IO: Failed to fetch chat history:', err.message);
      socket.emit('error', { message: 'Failed to load chat history' });
    }
  });

  socket.on('sendMessage', async (data) => {
    if (!data.message?.trim()) {
      console.log('Socket.IO: Empty message received from:', userId);
      socket.emit('error', { message: 'Message cannot be empty' });
      return;
    }
    console.log('Socket.IO: Received sendMessage from:', userId, 'Data:', data);
    const message = {
      user: isAdmin ? data.user : userId,
      message: data.message.trim(),
      sender: isAdmin ? 'admin' : 'user',
      createdAt: new Date(),
    };

    try {
      const newMessage = new ChatMessage(message);
      await newMessage.save();
      console.log('Socket.IO: Saved message:', newMessage);

      // Emit to user's room
      io.to(message.user).emit('message', newMessage);
      console.log('Socket.IO: Emitted message to user room:', message.user);

      // Emit to all admins
      io.sockets.sockets.forEach((adminSocket) => {
        if (adminSocket.user.role === 'admin' && adminSocket.id !== socket.id) {
          adminSocket.emit('message', newMessage);
        }
      });
      console.log('Socket.IO: Emitted message to admins');
    } catch (err) {
      console.error('Socket.IO: Failed to save message:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('closeChat', async (chatUserId) => {
    if (!isAdmin) {
      console.log('Socket.IO: Non-admin attempted to close chat:', userId);
      return;
    }
    console.log('Socket.IO: closeChat:', chatUserId, 'by:', userId);
    try {
      io.to(chatUserId).emit('chatClosed');
      delete activeChats[chatUserId];
      io.emit('userStatus', { userId: chatUserId, status: 'offline' });
      console.log('Socket.IO: Chat closed for:', chatUserId);
    } catch (err) {
      console.error('Socket.IO: Failed to close chat:', err.message);
      socket.emit('error', { message: 'Failed to close chat' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO: Disconnected:', socket.id, 'User:', userId);
    if (!isAdmin && activeChats[userId]) {
      delete activeChats[userId];
      io.emit('userStatus', { userId, status: 'offline' });
      console.log('Socket.IO: User status updated: offline', userId);
    }
  });

  socket.on('newShipment', (shipment) => {
    console.log('Socket.IO: New shipment:', shipment.trackingId);
    io.emit('shipmentUpdate', shipment);
  });

  socket.on('connect_error', (err) => {
    console.log('Socket.IO: Connection error:', err.message);
    socket.emit('error', { message: `Connection error: ${err.message}` });
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));