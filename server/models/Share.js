import mongoose from 'mongoose';

const ShareSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sharedWithMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
  },
  permission: {
    type: String,
    enum: ['view_only', 'view_download', 'manage'],
    default: 'view_only',
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  maxAccesses: {
    type: Number,
    default: 20,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  qrCodeDataUrl: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Share', ShareSchema);
