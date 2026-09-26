import express from 'express';
import {
  getFamily,
  updateFamily,
  getMemberById,
  addMember,
  updateMember,
  deleteMember,
} from '../controllers/familyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getFamily);
router.put('/', updateFamily);
router.get('/members/:id', getMemberById);
router.post('/members', addMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

export default router;
