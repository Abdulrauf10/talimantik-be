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

  const user = await prisma.user.create({
    data: {
      username: data.username,
      passwordHash,
      name: data.name,
      email: data.email?.toLowerCase() ?? null,
      phone: data.phone ?? null,
      city: data.city ?? null,
      age: data.age ?? null,
      gender: data.gender ?? null,
    },
  });

  const token = signJwt({ sub: user.id, role: user.role });
  const { passwordHash: _, ...safe } = user;
  return { user: safe, token };
}

export async function login(username: string, password: string) {
  const user = prisma.user.findUnique({ where: { username } });
  if (!user || !user.passwordHash) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = signJwt({ sub: user.id, role: user.role });
  const { passwordHash: _, ...safe } = user;
  return { user: safe, token };
}
