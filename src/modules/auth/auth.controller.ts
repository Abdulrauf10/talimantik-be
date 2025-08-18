import { Request, Response } from 'express';
import { register, login, signJwt } from './auth.service';
import { registerSchema, loginSchema } from './auth.validators';
import passport from 'passport';

export async function registerController(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const result = await register(parsed.data);
  res.status(201).json(result);
}

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const result = await login(parsed.data.username, parsed.data.password);
  res.json(result);
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
