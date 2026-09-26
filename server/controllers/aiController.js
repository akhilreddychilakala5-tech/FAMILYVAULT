import aiService from '../services/aiService.js';
import Document from '../models/Document.js';
import FamilyMember from '../models/FamilyMember.js';
import Warranty from '../models/Warranty.js';
import Bill from '../models/Bill.js';

export const extractDocument = async (req, res) => {
  try {
    const fileInfo = req.file || {
      originalname: req.body.filename || req.body.name || 'Sample_Document.pdf',
      mimetype: req.body.fileType || 'application/pdf',
      size: req.body.fileSize || 512000,
      path: req.file?.path,
    };

    const memberName = req.body.memberName || 'Family Member';
    const extraction = await aiService.extractMetadata(fileInfo, memberName);

    res.json({
      success: true,
      extraction,
      message: 'Processed via FamilyVault Neural OCR Engine. Review and edit details before saving.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const summarizeDocument = async (req, res) => {
  try {
    const { documentId } = req.body;

    let doc = null;
    if (documentId) {
      doc = await Document.findOne({
        _id: documentId,
        familyId: req.user.familyId,
      });
    }

    if (!doc && req.body.document) {
      doc = req.body.document;
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const summary = await aiService.summarize(doc);

    if (doc._id && typeof doc.save === 'function') {
      doc.aiSummary = {
        whatIsIt: summary.whatIsIt,
        importantDates: summary.importantDates,
        importantNumbers: summary.importantNumbers,
        keyTerms: summary.keyTerms,
        actionsRequired: summary.actionsRequired,
        generatedAt: new Date(),
      };
      await doc.save();
    }

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const vaultAssistant = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a question or search prompt.' });
    }

    const familyId = req.user.familyId;

    const documents = await Document.find({ familyId })
      .populate('memberId', 'name relationship avatar role');
    const members = await FamilyMember.find({ familyId });
    const warranties = await Warranty.find({ familyId });
    const bills = await Bill.find({ familyId });

    const result = await aiService.askAssistant({
      query,
      documents,
      members,
      warranties,
      bills,
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Vault Health & Gap Audit
export const getVaultHealth = async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const documents = await Document.find({ familyId }).populate('memberId', 'name relationship');
    const members = await FamilyMember.find({ familyId });

    const audit = aiService.auditHealth({ documents, members });

    res.json({
      success: true,
      audit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: AI Document Drafter
export const draftLetter = async (req, res) => {
  try {
    const { documentId, letterType = 'warranty_claim', customNotes = '' } = req.body;

    const doc = await Document.findOne({
      _id: documentId,
      familyId: req.user.familyId,
    }).populate('memberId', 'name relationship');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const draft = aiService.draftLetter({
      document: doc,
      letterType,
      user: req.user,
      customNotes,
    });

    res.json({
      success: true,
      draft,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Ask This Document (Q&A Scoped to Single Document)
export const askDocument = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a question about this document.' });
    }

    const doc = await Document.findOne({
      _id: documentId,
      familyId: req.user.familyId,
    }).populate('memberId', 'name relationship');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const answer = aiService.askDocument({
      document: doc,
      question: question.trim(),
    });

    res.json({
      success: true,
      answer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Travel Readiness Checker
export const checkTravelReadiness = async (req, res) => {
  try {
    const { destination = 'International Travel (General)' } = req.body;
    const familyId = req.user.familyId;

    const documents = await Document.find({ familyId }).populate('memberId', 'name relationship avatar');
    const members = await FamilyMember.find({ familyId });

    const readiness = aiService.checkReadiness({
      documents,
      members,
      destination,
    });

    res.json({
      success: true,
      readiness,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
