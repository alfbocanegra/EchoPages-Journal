import { Router } from 'express';
import { TOTPController } from '../../controllers/auth/TOTPController';

const router = Router();

router.post('/setup', TOTPController.setup);
router.post('/verify', TOTPController.verify);
router.post('/disable', TOTPController.disable);
router.get('/status', TOTPController.status);

export default router;
