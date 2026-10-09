import { Router } from 'express';
import { ingestMobileDevice } from '../controllers/ingestController';

const router = Router();

// Write-only public ingestion. No GET/list/read of existing records.
router.post('/mobile-device', ingestMobileDevice);

export default router;
