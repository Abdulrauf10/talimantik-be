import { z } from "zod"

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
})

export const env = EnvSchema.parse(process.env)