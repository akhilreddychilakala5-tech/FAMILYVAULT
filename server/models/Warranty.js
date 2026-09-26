import mongoose from 'mongoose';

const WarrantySchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  modelNumber: {
    type: String,
    default: '',
  },
  serialNumber: {
    type: String,
    default: '',
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  warrantyExpiry: {
    type: Date,
    required: true,
  },
  retailer: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Warranty', WarrantySchema);
