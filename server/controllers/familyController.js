import Family from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';
import Document from '../models/Document.js';
import ActivityLog from '../models/ActivityLog.js';

export const getFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.user.familyId);
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found.' });
    }

    const members = await FamilyMember.find({ familyId: family._id });
    const now = new Date();

    // Enrich each member with their live document stats
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const docs = await Document.find({ familyId: family._id, memberId: member._id });
        let expiringSoon = 0;
        let expired = 0;

        docs.forEach((d) => {
          if (d.expiryDate) {
            const diffDays = Math.ceil((new Date(d.expiryDate) - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) expired++;
            else if (diffDays <= 30) expiringSoon++;
          }
        });

        return {
          ...member.toObject(),
          documentCount: docs.length,
          expiringSoonCount: expiringSoon,
          expiredCount: expired,
        };
      })
    );

    res.json({
      success: true,
      family,
      members: enrichedMembers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFamily = async (req, res) => {
  try {
    const { name } = req.body;
    const family = await Family.findByIdAndUpdate(
      req.user.familyId,
      { name },
      { new: true }
    );
    res.json({ success: true, family });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Family member not found.' });
    }

    const documents = await Document.find({
      familyId: req.user.familyId,
      memberId: member._id,
    }).sort('-createdAt');

    const now = new Date();
    let expiringSoon = 0;
    let expired = 0;

    const refreshedDocs = documents.map((doc) => {
      let status = 'no_expiry';
      if (doc.expiryDate) {
        const diffDays = Math.ceil((new Date(doc.expiryDate) - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          status = 'expired';
          expired++;
        } else if (diffDays <= 30) {
          status = 'expiring_soon';
          expiringSoon++;
        } else {
          status = 'active';
        }
      }
      doc.status = status;
      return doc;
    });

    res.json({
      success: true,
      member,
      documents: refreshedDocs,
      stats: {
        totalDocuments: documents.length,
        expiringSoon,
        expired,
        active: documents.length - expiringSoon - expired,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { name, relationship, role, avatar, permissions, email } = req.body;

    if (!name || !relationship) {
      return res.status(400).json({ success: false, message: 'Name and relationship are required.' });
    }

    const member = await FamilyMember.create({
      familyId: req.user.familyId,
      name,
      relationship,
      role: role || 'member',
      avatar: avatar || '',
      email: email || '',
      permissions: permissions || { canUpload: true, canDownload: true, canDelete: false },
    });

    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'member_add',
      metadata: { memberName: member.name, relationship: member.relationship },
    });

    res.status(201).json({
      success: true,
      message: `${name} has been added to the family vault.`,
      member: {
        ...member.toObject(),
        documentCount: 0,
        expiringSoonCount: 0,
        expiredCount: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { name, relationship, role, avatar, permissions, email } = req.body;

    const member = await FamilyMember.findOneAndUpdate(
      { _id: req.params.id, familyId: req.user.familyId },
      { name, relationship, role, avatar, permissions, email },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    res.json({ success: true, message: 'Member updated successfully.', member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    // Check if member is primary self
    if (member.relationship === 'Self') {
      return res.status(400).json({ success: false, message: 'Cannot delete the primary vault owner.' });
    }

    // Reassign documents to primary owner or prevent deletion
    const selfMember = await FamilyMember.findOne({ familyId: req.user.familyId, relationship: 'Self' });
    if (selfMember) {
      await Document.updateMany({ memberId: member._id }, { memberId: selfMember._id });
    }

    await FamilyMember.findByIdAndDelete(member._id);

    res.json({
      success: true,
      message: 'Family member removed. Any existing documents were safely transferred to the primary vault owner.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
