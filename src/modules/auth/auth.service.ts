import { prisma } from '../../core/database/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../core/config/env';

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
}
