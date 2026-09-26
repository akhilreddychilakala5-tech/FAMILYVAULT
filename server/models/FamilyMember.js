import mongoose from 'mongoose';

const FamilyMemberSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    required: true,
    enum: ['Self', 'Father', 'Mother', 'Son', 'Daughter', 'Spouse', 'Grandfather', 'Grandmother', 'Sibling', 'Other'],
  },
  role: {
    type: String,
    enum: ['owner', 'member', 'viewer'],
    default: 'member',
  },
  avatar: {
    type: String,
    default: '',
  },
  permissions: {
    canUpload: { type: Boolean, default: true },
    canDownload: { type: Boolean, default: true },
    canDelete: { type: Boolean, default: false },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('FamilyMember', FamilyMemberSchema);
