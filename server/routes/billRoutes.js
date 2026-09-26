import express from 'express';
import { getBills, createBill, updateBillStatus, deleteBill } from '../controllers/billController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getBills);
router.post('/', createBill);
router.patch('/:id/status', updateBillStatus);
router.delete('/:id', deleteBill);

export default router;
