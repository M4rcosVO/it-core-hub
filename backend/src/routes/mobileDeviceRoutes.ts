import { Router } from 'express';
import {
  getAllMobileDevices,
  getMobileDeviceById,
  createMobileDevice,
  updateMobileDevice,
  deleteMobileDevice,
  exportMobileDevices,
} from '../controllers/mobileDeviceController';

const router = Router();

// Export route must come before /:id to prevent matching 'export' as an id
router.get('/export', exportMobileDevices);
router.get('/', getAllMobileDevices);
router.get('/:id', getMobileDeviceById);
router.post('/', createMobileDevice);
router.put('/:id', updateMobileDevice);
router.delete('/:id', deleteMobileDevice);

export default router;
