import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, OrderController.createOrder);
router.get('/', authenticateToken, OrderController.getOrders);
router.get('/:id', OrderController.getOrderDetails); // Public/Authenticated tracking lookup
router.patch('/:id/status', authenticateToken, OrderController.updateStatus);
router.post('/:id/reschedule', authenticateToken, OrderController.rescheduleOrder);
router.post('/:id/assign', authenticateToken, requireRole('ADMIN'), OrderController.assignAgent);
router.patch('/:id/override', authenticateToken, requireRole('ADMIN'), OrderController.overrideStatus);

export default router;
