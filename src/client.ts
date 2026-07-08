import { Client as Discord, Events } from 'discord.js'
import type { Collection } from 'discord.js'
import type { Logger } from 'winston'
import type { Command } from './types/command.types.js'
import type { CommandLoader } from './lib/command-loader.js'
import { InteractionHandler } from './lib/interaction-handler.js'

export class Bot {
  private commands: Collection<string, Command> | null = null

  constructor(
    private readonly client: Discord,
    private readonly loader: CommandLoader,
    private readonly logger: Logger
  ) {}

  /**
   * Launch the bot: load commands, register listeners
   * then connect to Discord.
   *
   *
   * @param token - Discord token
   * @throws if the connection fails
   */
  async start(token: string): Promise<void> {
    this.commands = await this.loader.load()
    this.logger.info(`Loaded ${this.commands.size} command(s).`)

    this.registerListeners()
    this.registerShutdownHooks()

    await this.client.login(token)
  }

  /**
   * Register Discord event listeners.
   */
  private registerListeners(): void {
    const handler = new InteractionHandler(this.commands!, this.logger)

    this.client.once(Events.ClientReady, (client) => {
      this.logger.info(`Logged in as ${client.user.tag}!`)
    })

    this.client.on(Events.InteractionCreate, (interaction) => {
      // isolate the await to prevent unhandled errors from killing the process
      handler.handle(interaction).catch((error) => {
        this.logger.error('Unhandled interaction error:', error)
      })
    })

    this.client.on(Events.Error, (error) => {
      this.logger.error('Discord client error:', error)
    })

    this.client.on(Events.Warn, (message) => {
      this.logger.warn(`Discord warning: ${message}`)
    })
  }

  /**
   * Set up a custom shutdown hook (SIGINT / SIGTERM).
   * Important to prevent a gateway connection from hanging
   * during a redeployment.
   */
  private registerShutdownHooks(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}, shutting down…`)
      try {
        await this.client.destroy()
        this.logger.info('Discord client destroyed cleanly.')
        process.exit(0)
      } catch (error) {
        this.logger.error('Error during shutdown:', error)
        process.exit(1)
      }
    }

    process.once('SIGINT', () => void shutdown('SIGINT'))
    process.once('SIGTERM', () => void shutdown('SIGTERM'))
  }

  /**
   * Manual stop (useful for testing or controlled restart).
   */
  async stop(): Promise<void> {
    await this.client.destroy()
    this.commands = null
  }
}
