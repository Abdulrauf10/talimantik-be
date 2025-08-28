import { Request, Response } from 'express';
import {
  register,
  login,
  signJwt,
  requestPasswordReset,
  resetPassword,
} from './auth.service';
import { registerSchema, loginSchema } from './auth.validators';
import passport from 'passport';
import { createPayment } from '../payment/midtrans.service';

export async function registerController(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const payment = await register(parsed.data);

  // Step 2: Send to Midtrans
  const midtrans = await createPayment(
    payment.username,
    payment.email!,
    payment.amount,
    payment.orderId,
  );

  res.status(201).json({
    message: 'Please complete payment to finish registration',
    payment_url: midtrans.redirect_url,
    orderId: payment.orderId,
  });
}

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const result = await login(parsed.data.username, parsed.data.password);
  res.json(result);
}

export async function forgotPasswordController(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPassword(token, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export const googleAuthController = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

export const googleCallbackController = [
  passport.authenticate('google', { session: false }),
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const token = signJwt({ sub: user.id, role: user.role });
    res.json({ user, token });
  },
];
