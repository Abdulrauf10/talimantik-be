import midtransCient from 'midtrans-client';
import { prisma } from '../../core/database/prisma';
import crypto from 'crypto';
import { finalizeRegistration } from '../auth/auth.service';

const snap = new midtransCient.Snap({
  isProduction: false, //change to true in production
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// create payment request
export async function createPayment(
  username: string,
  email: string,
  amount: number,
  orderId: string,
) {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: username,
      email: email,
    },
    callbacks: {
      finish: 'http://localhost:3000/payment/success', // Next.js page
      pending: 'http://localhost:3000/payment/pending',
      error: 'http://localhost:3000/payment/failed',
    },
  };

  const transaction = await snap.createTransaction(parameter);
  return { redirect_url: transaction.redirect_url, orderId };
}

// verify signature from midtrans
function verifySignatureKey(body: any) {
  const { order_id, status_code, gross_amount, signature_key } = body;

  const input =
    order_id + status_code + gross_amount + process.env.MIDTRANS_SERVER_KEY;
  const hash = crypto.createHash('sha512').update(input).digest('hex');

  return hash === signature_key;
}

export async function handlePaymentNotification(notification: any) {
  // verify signature
  if (!verifySignatureKey(notification)) {
    throw new Error('Invalid signature from Midtrans');
  }

  const orderId = notification.order_id;
  const transactionStatus = notification.transaction_status;
  const fraudStatus = notification.fraud_status;

  let status: 'SUCCESS' | 'FAILED' | 'PENDING' = 'PENDING';

  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') status = 'SUCCESS';
  } else if (transactionStatus === 'settlement') {
    status = 'SUCCESS';
  } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
    status = 'FAILED';
  }

  const payment = await prisma.payment.update({
    where: { orderId },
    data: { status },
  });

  // If success, finalize registration
  if (status === 'SUCCESS' && !payment.userId) {
    return await finalizeRegistration(orderId);
  }

  return payment;
}
