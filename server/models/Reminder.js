import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  reminderDate: {
    type: Date,
    required: true,
  },
  daysBefore: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['expiry', 'warranty', 'bill', 'custom'],
    default: 'expiry',
  },
  status: {
    type: String,
    enum: ['pending', 'triggered', 'dismissed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Reminder', ReminderSchema);
