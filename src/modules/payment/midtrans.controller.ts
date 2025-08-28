import { Request, Response } from 'express';
import { handlePaymentNotification } from './midtrans.service';

export async function midtransWebhookController(req: Request, res: Response) {
  try {
    const result = await handlePaymentNotification(req.body);
    res.json({ status: 'ok', result });
  } catch (e: any) {
    console.error('Webhook error:', e.message);
    res.status(403).json({ error: 'Invalid webhook signature' });
  }
}
