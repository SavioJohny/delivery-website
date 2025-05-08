import express from 'express';
import auth from '../middleware/auth.js';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/admin', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admins only' });
  }
  try {
    const users = await User.find({ role: 'user' }).select('name _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;