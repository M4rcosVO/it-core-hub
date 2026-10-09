import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ingestMobileDevice } from '../controllers/ingestController';

const router = Router();

// Rate limit: máximo 15 requisições por IP a cada 15 minutos
const ingestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas a partir deste endereço IP. Tente novamente mais tarde.',
  },
});

// Write-only public ingestion protegido por rate limiting
router.post('/mobile-device', ingestLimiter, ingestMobileDevice);

export default router;
