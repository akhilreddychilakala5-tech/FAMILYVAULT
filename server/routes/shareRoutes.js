import express from 'express';
import {
  createShare,
  getShareByToken,
  listShares,
  revokeShare,
  downloadSharedDocument,
  getNetworkOptions,
  regenerateQrCode,
} from '../controllers/shareController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public endpoints
router.get('/network-options', getNetworkOptions);
router.get('/token/:token', getShareByToken);
router.get('/token/:token/download', downloadSharedDocument);

// Protected routes for the vault owner/family
router.use(protect);
router.post('/', createShare);
router.post('/regenerate-qr', regenerateQrCode);
router.get('/', listShares);
router.delete('/:id', revokeShare);

export default router;
