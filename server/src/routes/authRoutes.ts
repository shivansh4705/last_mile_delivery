import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/quick-login', AuthController.quickLogin);
router.get('/me', authenticateToken, AuthController.me);

export default router;
