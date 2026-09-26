import Reminder from '../models/Reminder.js';
import Document from '../models/Document.js';
import User from '../models/User.js';

export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      familyId: req.user.familyId,
    })
      .populate('documentId', 'name category expiryDate status fileUrl')
      .sort('reminderDate');

    res.json({
      success: true,
      reminders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReminderSettings = async (req, res) => {
  try {
    const { reminderDays } = req.body;
    if (!reminderDays || !Array.isArray(reminderDays)) {
      return res.status(400).json({ success: false, message: 'Invalid reminder days array.' });
    }

    const user = await User.findById(req.user._id);
    user.preferences.reminderDays = reminderDays;
    await user.save();

    res.json({
      success: true,
      message: 'Reminder preferences updated successfully.',
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
