import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  billType: {
    type: String,
    required: true,
    enum: ['electricity', 'internet', 'mobile', 'water', 'gas', 'maintenance', 'other'],
    default: 'electricity',
  },
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['paid', 'due_soon', 'overdue'],
    default: 'due_soon',
  },
  paidAt: {
    type: Date,
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

export default mongoose.model('Bill', BillSchema);
