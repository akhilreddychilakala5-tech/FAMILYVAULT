import express from 'express';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  togglePin,
  toggleEmergency,
  downloadDocument,
  downloadDocumentFile,
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getDocuments);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.patch('/:id/pin', togglePin);
router.patch('/:id/emergency', toggleEmergency);
router.get('/:id/download', downloadDocument);
router.get('/:id/file', downloadDocumentFile);

export default router;
