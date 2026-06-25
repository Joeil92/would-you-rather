import { REST, Routes } from 'discord.js'
import type { Collection } from 'discord.js'
import type { Command } from '../types/command.types.js'
import type { Logger } from 'winston'

export class CommandDeployer {
  constructor(
    private readonly token: string,
    private readonly clientId: string,
    private readonly logger: Logger
  ) {}

  /**
   * Deploy commands to Discord.
   *
   * @param commands - Commands to deploy
   * @param guildId - Guild ID to deploy commands to
   *
   * @returns void
   * @throws if the deployment fails
   */
  async deploy(
    commands: Collection<string, Command>,
    guildId?: string
  ): Promise<void> {
    const rest = new REST().setToken(this.token)
    const body = commands.map((c) => c.data.toJSON())

    const route = guildId
      ? Routes.applicationGuildCommands(this.clientId, guildId)
      : Routes.applicationCommands(this.clientId)

    this.logger.info(`Refreshing ${body.length} (/) commands…`)
    const data = (await rest.put(route, { body })) as unknown[]
    this.logger.info(`Reloaded ${data.length} (/) commands.`)
  }
}
