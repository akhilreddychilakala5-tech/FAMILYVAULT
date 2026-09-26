import mongoose from 'mongoose';

const FamilySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'My Family Vault',
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Family', FamilySchema);
