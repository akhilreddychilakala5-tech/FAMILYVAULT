import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Identity',
        'Insurance',
        'Education',
        'Property',
        'Vehicle',
        'Financial',
        'Bills',
        'Warranty',
        'Other',
      ],
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    storageId: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: 'application/pdf',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    documentNumber: {
      type: String,
      trim: true,
      default: '',
    },
    issuingAuthority: {
      type: String,
      trim: true,
      default: '',
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'expiring_soon', 'expired', 'no_expiry'],
      default: 'no_expiry',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    aiSummary: {
      whatIsIt: { type: String, default: '' },
      importantDates: [{ type: String }],
      importantNumbers: [{ type: String }],
      keyTerms: [{ type: String }],
      actionsRequired: [{ type: String }],
      generatedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate status before saving
DocumentSchema.pre('save', function (next) {
  if (!this.expiryDate) {
    this.status = 'no_expiry';
  } else {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      this.status = 'expired';
    } else if (diffDays <= 30) {
      this.status = 'expiring_soon';
    } else {
      this.status = 'active';
    }
  }
  next();
});

// Helper static to compute status for arbitrary date
DocumentSchema.statics.computeStatus = function (expiryDate) {
  if (!expiryDate) return 'no_expiry';
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'active';
};

export default mongoose.model('Document', DocumentSchema);
