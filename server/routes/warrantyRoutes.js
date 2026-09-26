import express from 'express';
import { getWarranties, createWarranty, deleteWarranty } from '../controllers/warrantyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getWarranties);
router.post('/', createWarranty);
router.delete('/:id', deleteWarranty);

export default router;
