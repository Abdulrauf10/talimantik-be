import { prisma } from '../../core/database/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../core/config/env';
import { sendEmail } from '../../core/email/email';

export function signJwt(payload: object) {
  return jwt.sign(payload, env.JWT_SECRET);
}

export async function register(data: any) {
  const existing = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existing) throw new Error('Username already taken');

  if (data.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (byEmail) throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const payment = await prisma.payment.create({
    data: {
      username: data.username,
      email: data.email?.toLowerCase(),
      passwordHash,
      name: data.name,
      age: data.age,
      gender: data.gender,
      amount: Number(process.env.REGISTRATION_FEE) || 10000,
      status: 'PENDING',
      orderId: `REG-${Date.now()}`,
    },
  });

  return payment;
}

export async function finalizeRegistration(orderId: string) {
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'PENDING') throw new Error('Already processed');

  const user = await prisma.user.create({
    data: {
      username: payment.username,
      email: payment.email,
      passwordHash: payment.passwordHash!,
      name: payment.name!,
      phone: payment.phone,
      city: payment.city,
      age: payment.age,
      gender: payment.gender,
    },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'SUCCESS', userId: user.id },
  });

  const token = signJwt({ sub: user.id });
  const { passwordHash: _, ...safe } = user;
  return { user: safe, token };
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.passwordHash) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = signJwt({ sub: user.id });
  const { passwordHash: _, ...safe } = user;
  return { user: safe, token };
}

// Request password reset
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // valid for 15 mins

  await prisma.passwordReset.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail(
    user.email!,
    'Password Reset Request',
    `
      <h1>Reset Your Password</h1>
      <p>Click below to reset your password (expires in 15 minutes):</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  );

  return { message: 'Password reset email sent' };
}

// Reset password using token
export async function resetPassword(token: string, newPassword: string) {
  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset) throw new Error('Invalid token');
  if (reset.used) throw new Error('Token already used');
  if (reset.expiresAt < new Date()) throw new Error('Token expired');

  const hash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: reset.userId },
    data: { passwordHash: hash },
  });

  await prisma.passwordReset.update({
    where: { id: reset.id },
    data: { used: true },
  });

  return { message: 'Password successfully reset' };
}
