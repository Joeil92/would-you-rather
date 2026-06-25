import { envSchema } from './config.schemas.js'
import type { Env } from './config.types.js'

class ConfigService {
  private static instance: ConfigService
  private readonly env: Env

  private constructor() {
    const parsed = envSchema.safeParse(process.env)

    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n')
      throw new Error(`❌ Variables d'environnement invalides :\n${issues}`)
    }

    this.env = parsed.data
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  /**
   * Get a value from the environment
   *
   * @param key - Key of the value to get
   *
   * @returns Value of the environment
   */
  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key]
  }

  get all(): Readonly<Env> {
    return this.env
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production'
  }

  get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development'
  }

  get isTest(): boolean {
    return this.env.NODE_ENV === 'test'
  }
}

export const config = ConfigService.getInstance()
export type { Env }
