import { Router } from 'express';
import { RateCardController } from '../controllers/rateCardController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', RateCardController.getRateCards);
router.post('/preview', RateCardController.calculateRatePreview);
router.put('/:id', authenticateToken, requireRole('ADMIN'), RateCardController.updateRateCard);

export default router;
