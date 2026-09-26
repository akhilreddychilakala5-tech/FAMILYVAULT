import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Document from '../models/Document.js';
import FamilyMember from '../models/FamilyMember.js';
import ActivityLog from '../models/ActivityLog.js';
import Reminder from '../models/Reminder.js';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

export const getDocuments = async (req, res) => {
  try {
    const { category, memberId, status, isPinned, isEmergency, q, tag, sort = '-createdAt' } = req.query;
    const filter = { familyId: req.user.familyId };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (memberId && memberId !== 'All') {
      filter.memberId = memberId;
    }

    if (isPinned === 'true') {
      filter.isPinned = true;
    }

    if (isEmergency === 'true') {
      filter.isEmergency = true;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (q && q.trim() !== '') {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { documentNumber: searchRegex },
        { issuingAuthority: searchRegex },
        { notes: searchRegex },
        { tags: searchRegex },
      ];
    }

    let documents = await Document.find(filter)
      .populate('memberId', 'name relationship avatar role')
      .populate('ownerId', 'name email')
      .sort(sort);

    // Refresh dynamic status relative to today's date
    const now = new Date();
    documents = documents.map((doc) => {
      let currentStatus = 'no_expiry';
      if (doc.expiryDate) {
        const diffDays = Math.ceil((new Date(doc.expiryDate) - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) currentStatus = 'expired';
        else if (diffDays <= 30) currentStatus = 'expiring_soon';
        else currentStatus = 'active';
      }
      doc.status = currentStatus;
      return doc;
    });

    // If status filter applied
    if (status && status !== 'All') {
      documents = documents.filter((d) => d.status === status);
    }

    res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    })
      .populate('memberId', 'name relationship avatar role')
      .populate('ownerId', 'name email');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Refresh status
    if (doc.expiryDate) {
      const diffDays = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) doc.status = 'expired';
      else if (diffDays <= 30) doc.status = 'expiring_soon';
      else doc.status = 'active';
    } else {
      doc.status = 'no_expiry';
    }

    // Log view activity (throttled or record)
    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'view',
      documentId: doc._id,
      documentName: doc.name,
      metadata: { category: doc.category },
    });

    res.json({
      success: true,
      document: doc,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document file to upload.' });
    }

    const {
      name,
      category,
      memberId,
      documentNumber,
      issuingAuthority,
      issueDate,
      expiryDate,
      tags,
      notes,
      isPinned,
      isEmergency,
    } = req.body;

    // Validate memberId belongs to this family
    let resolvedMemberId = memberId;
    if (!resolvedMemberId) {
      const firstMember = await FamilyMember.findOne({ familyId: req.user.familyId });
      resolvedMemberId = firstMember ? firstMember._id : null;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const storageId = `LOCAL-${Date.now().toString().slice(-8)}`;

    const parsedTags = typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : Array.isArray(tags) ? tags : [];

    const newDoc = new Document({
      familyId: req.user.familyId,
      ownerId: req.user._id,
      memberId: resolvedMemberId,
      name: name || req.file.originalname,
      category: category || 'Other',
      fileUrl,
      storageId,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      documentNumber: documentNumber || '',
      issuingAuthority: issuingAuthority || '',
      issueDate: issueDate ? new Date(issueDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      tags: parsedTags,
      notes: notes || '',
      isPinned: isPinned === 'true' || isPinned === true,
      isEmergency: isEmergency === 'true' || isEmergency === true,
    });

    await newDoc.save();

    // Auto-schedule reminders if expiry date is present
    if (newDoc.expiryDate) {
      const reminderDays = req.user.preferences?.reminderDays || [7, 15, 30, 60];
      const expiry = new Date(newDoc.expiryDate);

      for (const days of reminderDays) {
        const reminderDate = new Date(expiry);
        reminderDate.setDate(expiry.getDate() - days);

        if (reminderDate > new Date()) {
          await Reminder.create({
            userId: req.user._id,
            familyId: req.user.familyId,
            documentId: newDoc._id,
            reminderDate,
            daysBefore: days,
            type: 'expiry',
          });
        }
      }

      // Check if it's already expiring soon (<30 days) and trigger immediate notification
      const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30 && diffDays >= 0) {
        await Notification.create({
          userId: req.user._id,
          familyId: req.user.familyId,
          documentId: newDoc._id,
          title: `Document Expiring Soon: ${newDoc.name}`,
          message: `${newDoc.name} expires in ${diffDays} days (${expiry.toLocaleDateString()}). Please initiate renewal.`,
          type: 'expiry_warning',
          severity: 'warning',
        });
      }
    }

    // Log Activity
    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'upload',
      documentId: newDoc._id,
      documentName: newDoc.name,
      metadata: { category: newDoc.category, size: newDoc.fileSize },
    });

    const populatedDoc = await Document.findById(newDoc._id)
      .populate('memberId', 'name relationship avatar role')
      .populate('ownerId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Document successfully saved to your FamilyVault.',
      document: populatedDoc,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ success: false, message: 'Document upload failed: ' + error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    const {
      name,
      category,
      memberId,
      documentNumber,
      issuingAuthority,
      issueDate,
      expiryDate,
      tags,
      notes,
      isPinned,
      isEmergency,
    } = req.body;

    if (name !== undefined) doc.name = name;
    if (category !== undefined) doc.category = category;
    if (memberId !== undefined) doc.memberId = memberId;
    if (documentNumber !== undefined) doc.documentNumber = documentNumber;
    if (issuingAuthority !== undefined) doc.issuingAuthority = issuingAuthority;
    if (issueDate !== undefined) doc.issueDate = issueDate ? new Date(issueDate) : undefined;
    if (expiryDate !== undefined) doc.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    if (notes !== undefined) doc.notes = notes;
    if (isPinned !== undefined) doc.isPinned = isPinned;
    if (isEmergency !== undefined) doc.isEmergency = isEmergency;

    if (tags !== undefined) {
      doc.tags = typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : Array.isArray(tags) ? tags : doc.tags;
    }

    await doc.save();

    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'update',
      documentId: doc._id,
      documentName: doc.name,
      metadata: { updatedFields: Object.keys(req.body) },
    });

    const populated = await Document.findById(doc._id)
      .populate('memberId', 'name relationship avatar role')
      .populate('ownerId', 'name email');

    res.json({
      success: true,
      message: 'Document updated successfully.',
      document: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Try to remove local file
    if (doc.fileUrl && doc.fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(doc.fileUrl);
      const filePath = path.resolve(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Failed to delete file from disk:', e.message);
        }
      }
    }

    await Document.findByIdAndDelete(doc._id);
    await Reminder.deleteMany({ documentId: doc._id });

    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'delete',
      documentId: doc._id,
      documentName: doc.name,
    });

    res.json({
      success: true,
      message: 'Document successfully deleted.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePin = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    doc.isPinned = !doc.isPinned;
    await doc.save();

    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'pin',
      documentId: doc._id,
      documentName: doc.name,
      metadata: { isPinned: doc.isPinned },
    });

    res.json({
      success: true,
      isPinned: doc.isPinned,
      message: doc.isPinned ? 'Document pinned to Family Essentials.' : 'Document unpinned.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleEmergency = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    doc.isEmergency = !doc.isEmergency;
    await doc.save();

    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'emergency',
      documentId: doc._id,
      documentName: doc.name,
      metadata: { isEmergency: doc.isEmergency },
    });

    res.json({
      success: true,
      isEmergency: doc.isEmergency,
      message: doc.isEmergency ? 'Document marked for Emergency Vault.' : 'Document removed from Emergency Vault.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'download',
      documentId: doc._id,
      documentName: doc.name,
    });

    res.json({
      success: true,
      fileUrl: doc.fileUrl,
      fileName: doc.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadDocumentFile = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!doc) {
      return res.status(404).send('Document not found.');
    }

    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'download',
      documentId: doc._id,
      documentName: doc.name,
    });

    const filename = path.basename(doc.fileUrl);
    const filePath = path.resolve(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found on server disk.');
    }

    const ext = path.extname(filename) || (doc.fileType?.includes('png') ? '.png' : doc.fileType?.includes('svg') ? '.svg' : '');
    let downloadName = doc.name || 'document';
    if (ext && !downloadName.toLowerCase().endsWith(ext.toLowerCase())) {
      downloadName = `${downloadName}${ext}`;
    }
    const safeName = downloadName.replace(/[^\w\s.-]/gi, '_');

    res.download(filePath, safeName);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
