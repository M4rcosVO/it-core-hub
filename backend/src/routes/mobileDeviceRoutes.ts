import { Router } from 'express';
import {
  getAllMobileDevices,
  getMobileDeviceById,
  createMobileDevice,
  updateMobileDevice,
  deleteMobileDevice,
} from '../controllers/mobileDeviceController';

const router = Router();

router.get('/', getAllMobileDevices);
router.get('/:id', getMobileDeviceById);
router.post('/', createMobileDevice);
router.put('/:id', updateMobileDevice);
router.delete('/:id', deleteMobileDevice);

export default router;
