import mongoose from 'mongoose';

const deliveryPreferencesSchema = new mongoose.Schema({
  timeSlot: { type: String, required: true },
  packaging: { type: String, enum: ['standard', 'eco-friendly', 'premium'], default: 'standard' },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Allow null for guests
  trackingId: { type: String, required: true, unique: true },
  deliveryPreferences: { type: deliveryPreferencesSchema, required: true },
  paymentMethod: { type: String, enum: ['card', 'upi', 'wallet', 'cod'], required: true },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
  },
  awbNumber: { type: String, unique: true }, // Added for tracking
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);