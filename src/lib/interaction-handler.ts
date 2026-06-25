import { MessageFlags } from 'discord.js'
import type {
  Interaction,
  Collection,
  InteractionReplyOptions,
} from 'discord.js'
import type { Command } from '../types/command.types.js'
import type { Logger } from 'winston'

export class InteractionHandler {
  constructor(
    private readonly commands: Collection<string, Command>,
    private readonly logger: Logger
  ) {}

  /**
   * Handle an interaction.
   *
   * @param interaction - Interaction to handle
   *
   * @returns void
   */
  async handle(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return

    const command = this.commands.get(interaction.commandName)
    if (!command) {
      this.logger.warn(`Unknown command: ${interaction.commandName}`)
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      this.logger.error(error)
      const payload: InteractionReplyOptions = {
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
      }

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload)
      } else {
        await interaction.reply(payload)
      }
    }
  }
}
