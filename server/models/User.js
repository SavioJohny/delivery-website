import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    match: [/^[a-zA-Z\s]{1,50}$/, 'Name must be 1-50 characters and contain only letters and spaces'],
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);