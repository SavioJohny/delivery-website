import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    default: 'open', 
    enum: ['open', 'in-progress', 'resolved', 'closed'] 
  },
  replies: [
    {
      message: { type: String, required: true },
      sender: { type: String, enum: ['user', 'admin'], required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);