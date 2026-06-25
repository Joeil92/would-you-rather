import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js'
import type { Command } from '../types/command.types.js'

class WouldYouRatherCommand implements Command {
  readonly data = new SlashCommandBuilder()
    .setName('wyr')
    .setDescription('Generate a "Would you rather..." question')

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Would you rather...')
  }
}

export default new WouldYouRatherCommand()
