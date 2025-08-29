import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(['laki_laki', 'perempuan']).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});
