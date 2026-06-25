import type { z } from 'zod'
import type { envSchema } from './config.schemas.js'

export type Env = z.infer<typeof envSchema>
