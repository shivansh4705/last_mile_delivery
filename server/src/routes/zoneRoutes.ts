import { Router } from 'express';
import { ZoneController } from '../controllers/zoneController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', ZoneController.getZones);
router.post('/', authenticateToken, requireRole('ADMIN'), ZoneController.createZone);
router.post('/:zoneId/areas', authenticateToken, requireRole('ADMIN'), ZoneController.addAreaToZone);
router.delete('/areas/:areaId', authenticateToken, requireRole('ADMIN'), ZoneController.removeArea);

export default router;
