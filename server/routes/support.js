import express from 'express';
import auth from '../middleware/auth.js';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { subject, message } = req.body;
  console.log('POST /api/support: Token:', req.headers['x-auth-token']);
  console.log('POST /api/support: req.user:', req.user);
  if (!subject?.trim() || !message?.trim()) {
    return res.status(400).json({ msg: 'Subject and message are required' });
  }
  if (!req.user || !req.user._id) {
    return res.status(401).json({ msg: 'User authentication failed' });
  }
  try {
    const ticket = new SupportTicket({
      user: req.user._id,
      subject: subject.trim(),
      message: message.trim(),
    });
    await ticket.save();
    res.json({ msg: 'Support ticket submitted', ticket });
  } catch (err) {
    console.error('Error creating ticket:', err.message, err.stack);
    res.status(500).json({ msg: 'Server error: Failed to create ticket' });
  }
});

router.get('/', auth, async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ msg: 'User authentication failed' });
  }
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).populate('user', 'name');
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching user tickets:', err.message, err.stack);
    res.status(500).json({ msg: 'Server error: Failed to fetch tickets' });
  }
});

router.get('/admin', auth, async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ msg: 'User authentication failed' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admins only' });
  }
  try {
    const tickets = await SupportTicket.find().populate('user', 'name');
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching admin tickets:', err.message, err.stack);
    res.status(500).json({ msg: 'Server error: Failed to fetch tickets' });
  }
});

router.post('/reply/:id', auth, async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ msg: 'User authentication failed' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admins only' });
  }
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ msg: 'Reply message is required' });
  }
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
    ticket.replies.push({
      message: message.trim(),
      sender: 'admin',
      createdAt: new Date(),
    });
    ticket.status = 'in-progress';
    await ticket.save();
    res.json({ msg: 'Reply added', ticket });
  } catch (err) {
    console.error('Error adding reply:', err.message, err.stack);
    res.status(500).json({ msg: 'Server error: Failed to add reply' });
  }
});

router.put('/close/:id', auth, async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ msg: 'User authentication failed' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admins only' });
  }
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
    if (ticket.status === 'closed') {
      return res.status(400).json({ msg: 'Ticket already closed' });
    }
    ticket.status = 'closed';
    await ticket.save();
    res.json({ msg: 'Ticket closed', ticket });
  } catch (err) {
    console.error('Error closing ticket:', err.message, err.stack);
    res.status(500).json({ msg: 'Server error: Failed to close ticket' });
  }
});

export default router;