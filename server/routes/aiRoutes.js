import express from 'express';
import {
  extractDocument,
  summarizeDocument,
  vaultAssistant,
  getVaultHealth,
  draftLetter,
  askDocument,
  checkTravelReadiness,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.post('/document-extraction', upload.single('file'), extractDocument);
router.post('/document-summary', summarizeDocument);
router.post('/vault-assistant', vaultAssistant);

// Advanced AI Features
router.get('/vault-health', getVaultHealth);
router.post('/draft-letter', draftLetter);
router.post('/ask-document', askDocument);
router.post('/travel-readiness', checkTravelReadiness);

export default router;
