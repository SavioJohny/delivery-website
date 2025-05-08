import express from 'express';
const router = express.Router();

router.post('/checkout', async (req, res) => {
  const { user, deliveryPreferences, paymentMethod, status } = req.body;
  const token = req.headers['x-auth-token'];

  try {
    console.log('Request body:', req.body);
    if (!deliveryPreferences?.timeSlot || !paymentMethod) {
      return res.status(400).json({ message: 'Time slot and payment method are required' });
    }
    if (!['card', 'upi', 'wallet', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    if (!deliveryPreferences.timeSlot || !['standard', 'eco-friendly', 'premium'].includes(deliveryPreferences.packaging)) {
      return res.status(400).json({ message: 'Invalid delivery preferences' });
    }

    let decodedUser = null;
    if (token) {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      if (user && decodedUser.user._id !== user.toString()) {
        return res.status(403).json({ message: 'Unauthorized user' });
      }
    } else if (user) {
      return res.status(401).json({ message: 'Token required for registered users' });
    }

    const order = new Order({
      user: user || null,
      trackingId: `TRK-${Math.floor(Math.random() * 1000000)}`,
      deliveryPreferences: {
        timeSlot: deliveryPreferences.timeSlot,
        packaging: deliveryPreferences.packaging || 'standard',
      },
      paymentMethod,
      status: status || 'pending',
      awbNumber: `AWB-${Math.floor(Math.random() * 1000000)}`,
    });

    await order.save();
    io.emit('orderConfirmation', order);
    console.log(`Order confirmed: AWB ${order.awbNumber} for user ${user || 'Guest'}`);
    res.status(201).json(order);
  } catch (err) {
    console.error('Checkout error:', err.stack);
    res.status(500).json({ message: 'Error processing order', error: err.message });
  }
});

export default router;