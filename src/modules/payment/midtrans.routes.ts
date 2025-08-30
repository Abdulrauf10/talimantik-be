import { Router } from 'express';
import { midtransWebhookController } from './midtrans.controller';

const router = Router();

// Midtrans webhook callback
router.post('/webhook', midtransWebhookController);

export default router;
