import { Router } from 'express';
import { listStores, toggleStoreStatus } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/stores', listStores);
router.put('/stores/:id/status', toggleStoreStatus);

export default router;
