import { Router } from 'express';
import { AgentController } from '../controllers/agentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, AgentController.getAgents);
router.patch('/status', authenticateToken, requireRole('AGENT'), AgentController.updateAgentStatus);

export default router;
