import Warranty from '../models/Warranty.js';
import Document from '../models/Document.js';

export const getWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.find({
      familyId: req.user.familyId,
    })
      .populate('documentId', 'name fileUrl fileSize fileType')
      .sort('warrantyExpiry');

    const now = new Date();
    const enriched = warranties.map((w) => {
      const diffDays = Math.ceil((new Date(w.warrantyExpiry) - now) / (1000 * 60 * 60 * 24));
      let status = 'active';
      if (diffDays < 0) status = 'expired';
      else if (diffDays <= 30) status = 'expiring_soon';

      return {
        ...w.toObject(),
        status,
        daysRemaining: diffDays,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      warranties: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWarranty = async (req, res) => {
  try {
    const {
      productName,
      brand,
      modelNumber,
      serialNumber,
      purchaseDate,
      warrantyExpiry,
      retailer,
      notes,
      documentId,
    } = req.body;

    if (!productName || !brand || !purchaseDate || !warrantyExpiry) {
      return res.status(400).json({ success: false, message: 'Please provide all required warranty details.' });
    }

    const warranty = await Warranty.create({
      familyId: req.user.familyId,
      productName,
      brand,
      modelNumber: modelNumber || '',
      serialNumber: serialNumber || '',
      purchaseDate: new Date(purchaseDate),
      warrantyExpiry: new Date(warrantyExpiry),
      retailer: retailer || '',
      notes: notes || '',
      documentId: documentId || null,
    });

    const populated = await Warranty.findById(warranty._id).populate('documentId');

    res.status(201).json({
      success: true,
      message: 'Warranty successfully added to WarrantyVault.',
      warranty: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findOneAndDelete({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!warranty) {
      return res.status(404).json({ success: false, message: 'Warranty record not found.' });
    }

    res.json({ success: true, message: 'Warranty deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
