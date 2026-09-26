import crypto from 'crypto';
import QRCode from 'qrcode';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Share from '../models/Share.js';
import Document from '../models/Document.js';
import ActivityLog from '../models/ActivityLog.js';
import { getPublicTunnelUrl } from '../services/tunnelService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

// Helper to find best primary LAN IPv4 address (e.g. 192.168.x.x)
export const getPrimaryLanIp = () => {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, arr] of Object.entries(interfaces)) {
    for (const info of arr) {
      if (info.family === 'IPv4' && !info.internal && !info.address.startsWith('169.254')) {
        candidates.push({ name, address: info.address });
      }
    }
  }

  // Prioritize Ethernet or Wi-Fi interfaces
  const prioritized = candidates.find((c) => /ethernet|wi-fi|wlan/i.test(c.name));
  return prioritized ? prioritized.address : candidates[0]?.address || 'localhost';
};

// GET /api/shares/network-options
export const getNetworkOptions = (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    const networkIps = [];

    for (const [name, arr] of Object.entries(interfaces)) {
      for (const info of arr) {
        if (info.family === 'IPv4' && !info.internal && !info.address.startsWith('169.254')) {
          networkIps.push({
            name,
            ip: info.address,
            url: `http://${info.address}:5173`,
          });
        }
      }
    }

    const publicUrl = getPublicTunnelUrl();
    const primaryIp = getPrimaryLanIp();
    const primaryUrl = publicUrl || (primaryIp !== 'localhost' ? `http://${primaryIp}:5173` : 'http://localhost:5173');

    const options = [];

    if (publicUrl) {
      options.push({
        label: '🌐 Public Worldwide (Scan from ANY phone / 4G / 5G / Wi-Fi)',
        url: publicUrl,
        isPublic: true,
        recommended: true,
      });
    }

    networkIps.forEach((n) => {
      options.push({
        label: `📱 Local Wi-Fi (${n.name}: ${n.ip})`,
        url: n.url,
        isLocal: false,
        ip: n.ip,
        recommended: !publicUrl && n.ip === primaryIp,
      });
    });

    options.push({
      label: '💻 Localhost (This PC only)',
      url: 'http://localhost:5173',
      isLocal: true,
      ip: 'localhost',
      recommended: false,
    });

    res.json({
      success: true,
      options,
      defaultUrl: primaryUrl,
      defaultIp: primaryIp,
      publicUrl,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/shares
export const createShare = async (req, res) => {
  try {
    const {
      documentId,
      sharedWithMemberId,
      permission = 'view_download',
      expiresInDays = 7,
      maxAccesses = 20,
      clientOrigin,
      qrTarget = 'download', // 'download' (default for fast scanning) or 'page'
    } = req.body;

    const doc = await Document.findOne({
      _id: documentId,
      familyId: req.user.familyId,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(expiresInDays));

    // Determine the base origin
    let baseOrigin = clientOrigin;
    if (!baseOrigin) {
      const publicUrl = getPublicTunnelUrl();
      if (publicUrl) {
        baseOrigin = publicUrl;
      } else {
        const lanIp = getPrimaryLanIp();
        if (lanIp && lanIp !== 'localhost') {
          baseOrigin = `http://${lanIp}:5173`;
        } else {
          baseOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
        }
      }
    }

    const pageUrl = `${baseOrigin}/shared/${token}`;
    const directDownloadUrl = `${baseOrigin}/api/shares/token/${token}/download`;
    const targetUrl = qrTarget === 'download' && permission !== 'view_only' ? directDownloadUrl : pageUrl;

    // Generate high resolution QR code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 340,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const share = await Share.create({
      documentId: doc._id,
      familyId: req.user.familyId,
      sharedBy: req.user._id,
      sharedWithMemberId: sharedWithMemberId || null,
      permission,
      token,
      expiresAt,
      maxAccesses: Number(maxAccesses),
      qrCodeDataUrl,
    });

    await ActivityLog.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.name,
      action: 'share',
      documentId: doc._id,
      documentName: doc.name,
      metadata: { permission, expiresInDays, shareId: share._id, qrTarget },
    });

    res.status(201).json({
      success: true,
      share: {
        ...share.toObject(),
        shareUrl: pageUrl,
        downloadUrl: directDownloadUrl,
        targetUrl,
        qrTarget,
        baseOrigin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/shares/regenerate-qr
export const regenerateQrCode = async (req, res) => {
  try {
    const { token, origin, qrTarget = 'page' } = req.body;

    const share = await Share.findOne({ token, familyId: req.user.familyId }).populate('documentId');
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found.' });
    }

    let baseOrigin = origin;
    if (!baseOrigin) {
      const publicUrl = getPublicTunnelUrl();
      if (publicUrl) {
        baseOrigin = publicUrl;
      } else {
        const lanIp = getPrimaryLanIp();
        baseOrigin = lanIp !== 'localhost' ? `http://${lanIp}:5173` : 'http://localhost:5173';
      }
    }

    const pageUrl = `${baseOrigin}/shared/${token}`;
    const directDownloadUrl = `${baseOrigin}/api/shares/token/${token}/download`;
    const targetUrl = qrTarget === 'download' && share.permission !== 'view_only' ? directDownloadUrl : pageUrl;

    const qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 340,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    share.qrCodeDataUrl = qrCodeDataUrl;
    await share.save();

    res.json({
      success: true,
      qrCodeDataUrl,
      targetUrl,
      shareUrl: pageUrl,
      downloadUrl: directDownloadUrl,
      qrTarget,
      baseOrigin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/shares/token/:token
export const getShareByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const share = await Share.findOne({ token, isActive: true })
      .populate('sharedBy', 'name email')
      .populate('documentId');

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'This secure sharing link is invalid or has been revoked.',
      });
    }

    if (new Date() > new Date(share.expiresAt)) {
      return res.status(410).json({
        success: false,
        message: 'This secure sharing link has expired.',
      });
    }

    if (share.accessCount >= share.maxAccesses) {
      return res.status(429).json({
        success: false,
        message: 'Maximum allowed access limit for this share link has been reached.',
      });
    }

    // Increment access count
    share.accessCount += 1;
    await share.save();

    const canDownload = share.permission === 'view_download' || share.permission === 'manage';

    res.json({
      success: true,
      document: share.documentId,
      permission: share.permission,
      canDownload,
      downloadUrl: `/api/shares/token/${token}/download`,
      expiresAt: share.expiresAt,
      accessCount: share.accessCount,
      maxAccesses: share.maxAccesses,
      sharedBy: share.sharedBy?.name || 'Vault Owner',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/shares/token/:token/download
export const downloadSharedDocument = async (req, res) => {
  try {
    const { token } = req.params;
    const share = await Share.findOne({ token, isActive: true }).populate('documentId');

    if (!share) {
      return res.status(404).send('This secure sharing link is invalid or has been revoked.');
    }

    if (new Date() > new Date(share.expiresAt)) {
      return res.status(410).send('This secure sharing link has expired.');
    }

    if (share.accessCount >= share.maxAccesses) {
      return res.status(429).send('Maximum allowed access limit for this share link has been reached.');
    }

    if (share.permission === 'view_only') {
      return res.redirect(`/shared/${token}`);
    }

    const doc = share.documentId;
    if (!doc) {
      return res.status(404).send('Document not found in vault.');
    }

    share.accessCount += 1;
    await share.save();

    const filename = path.basename(doc.fileUrl);
    const filePath = path.resolve(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Document file not found on server disk.');
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

// GET /api/shares
export const listShares = async (req, res) => {
  try {
    const shares = await Share.find({
      familyId: req.user.familyId,
      isActive: true,
    })
      .populate('documentId', 'name category fileType')
      .populate('sharedWithMemberId', 'name relationship avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      shares,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/shares/:id
export const revokeShare = async (req, res) => {
  try {
    const share = await Share.findOneAndUpdate(
      { _id: req.params.id, familyId: req.user.familyId },
      { isActive: false },
      { new: true }
    );

    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found.' });
    }

    res.json({
      success: true,
      message: 'Share link revoked successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
