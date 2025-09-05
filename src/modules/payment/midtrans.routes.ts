import { Router } from 'express';
import { midtransWebhookController } from './midtrans.controller';
import { prisma } from '../../core/database/prisma';

const router = Router();

// Midtrans webhook callback
router.post('/webhook', midtransWebhookController);

router.get('/status/:orderId', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId: req.params.orderId },
      include: { User: true },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
