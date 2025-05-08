import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  sender: { type: String, enum: ['user', 'admin'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ChatMessage', chatMessageSchema);