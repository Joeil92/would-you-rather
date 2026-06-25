import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Discord
  DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN est requis'),
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID est requis'),
  DISCORD_GUILD_ID: z.string().optional(), // Deploy commands in dev env only
})
