import Bill from '../models/Bill.js';
import Document from '../models/Document.js';

export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({
      familyId: req.user.familyId,
    })
      .populate('documentId', 'name fileUrl fileSize fileType')
      .sort('dueDate');

    const now = new Date();
    const enriched = bills.map((b) => {
      let status = b.status;
      if (status !== 'paid') {
        const diffDays = Math.ceil((new Date(b.dueDate) - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) status = 'overdue';
        else if (diffDays <= 7) status = 'due_soon';
      }
      return {
        ...b.toObject(),
        status,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      bills: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBill = async (req, res) => {
  try {
    const { provider, billType, amount, dueDate, notes, documentId } = req.body;

    if (!provider || !amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Provider, amount, and due date are required.' });
    }

    const bill = await Bill.create({
      familyId: req.user.familyId,
      provider,
      billType: billType || 'electricity',
      amount: Number(amount),
      dueDate: new Date(dueDate),
      notes: notes || '',
      documentId: documentId || null,
      status: 'due_soon',
    });

    const populated = await Bill.findById(bill._id).populate('documentId');

    res.status(201).json({
      success: true,
      message: 'Bill record added.',
      bill: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBillStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bill = await Bill.findOne({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill record not found.' });
    }

    bill.status = status;
    if (status === 'paid') {
      bill.paidAt = new Date();
    }
    await bill.save();

    res.json({
      success: true,
      message: `Bill marked as ${status}.`,
      bill,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({
      _id: req.params.id,
      familyId: req.user.familyId,
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill record not found.' });
    }

    res.json({ success: true, message: 'Bill record deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
