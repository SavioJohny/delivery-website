import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackingId: { type: String, required: true, unique: true },
  senderName: { type: String, required: true },
  senderAddress: { type: String, required: true },
  receiverName: { type: String, required: true },
  receiverAddress: { type: String, required: true },
  packageWeight: { type: Number, required: true },
  packageType: { type: String, required: true, enum: ['standard', 'express', 'fragile'] },
  status: { type: String, default: 'pending', enum: ['pending', 'in-transit', 'delivered', 'failed'] },
  awbNumber: { type: String, required: true, unique: true },
  statusHistory: [{
    status: String,
    location: String,
    timestamp: Date
  }],
  additionalDetails: {
    packaging: String,
    dimensions: { length: Number, breadth: Number, height: Number, unit: String },
    contents: [String],
    packageValue: Number,
    pickupDate: String,
    securePackage: Boolean,
    deliveryDate: String,
    totalCost: Number,
    paymentMethod: String,
    upiId: String,
    cardNumber: String,
    phoneNumbers: [String]
  }
});

export default mongoose.model('Shipment', shipmentSchema);