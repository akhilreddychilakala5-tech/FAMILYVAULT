import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Family from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';
import ActivityLog from '../models/ActivityLog.js';

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'familyvault_super_secret_jwt_key_2026_dev_prod_guard',
    { expiresIn: '30d' }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create user placeholder first
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'owner',
    });

    // Create Family for user
    const family = await Family.create({
      name: `${name.split(' ')[0]}'s Family Vault`,
      ownerId: user._id,
    });

    user.familyId = family._id;
    await user.save();

    // Create default self member
    const selfMember = await FamilyMember.create({
      familyId: family._id,
      userId: user._id,
      name: name,
      relationship: 'Self',
      role: 'owner',
      permissions: { canUpload: true, canDownload: true, canDelete: true },
    });

    // Activity log
    await ActivityLog.create({
      familyId: family._id,
      userId: user._id,
      userName: user.name,
      action: 'upload',
      metadata: { note: 'Family Vault initialized' },
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        familyId: user.familyId,
        preferences: user.preferences,
        onboardingCompleted: user.onboardingCompleted,
      },
      family,
      primaryMemberId: selfMember._id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const family = await Family.findById(user.familyId);
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        familyId: user.familyId,
        preferences: user.preferences,
        onboardingCompleted: user.onboardingCompleted,
      },
      family,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const family = await Family.findById(user.familyId);
    const members = await FamilyMember.find({ familyId: user.familyId });

    res.json({
      success: true,
      user,
      family,
      members,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, preferences, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        familyId: user.familyId,
        preferences: user.preferences,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email ? email.toLowerCase() : '' });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with that email address.' });
    }

    // In a real email setup, we would dispatch a secure reset token via SendGrid / Resend.
    // For local / hackathon demonstration, we provide a confirmation message with immediate demo reset token.
    res.json({
      success: true,
      message: 'Password reset link dispatched. Please check your inbox or use the demo reset option.',
      demoResetToken: 'reset-' + Math.random().toString(36).substring(2, 10),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const { familyName, members = [], reminderDays = [7, 15, 30, 60] } = req.body;
    const user = await User.findById(req.user._id);

    // Update Family name
    if (familyName) {
      await Family.findByIdAndUpdate(user.familyId, { name: familyName });
    }

    // Update User preferences
    user.preferences.reminderDays = reminderDays;
    user.onboardingCompleted = true;
    await user.save();

    // Create provided members if array given
    if (members && members.length > 0) {
      for (const m of members) {
        if (!m.name) continue;
        const exists = await FamilyMember.findOne({ familyId: user.familyId, name: m.name });
        if (!exists) {
          await FamilyMember.create({
            familyId: user.familyId,
            name: m.name,
            relationship: m.relationship || 'Other',
            role: 'member',
            permissions: { canUpload: true, canDownload: true, canDelete: false },
          });
        }
      }
    }

    const updatedFamily = await Family.findById(user.familyId);
    const updatedMembers = await FamilyMember.find({ familyId: user.familyId });

    res.json({
      success: true,
      message: 'Onboarding completed successfully!',
      family: updatedFamily,
      members: updatedMembers,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        familyId: user.familyId,
        preferences: user.preferences,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
