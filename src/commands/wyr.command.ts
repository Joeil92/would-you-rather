import {
  PollLayoutType,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js'
import type { Command } from '../types/command.types.js'
import { llm } from '../lib/groq.js'

class WouldYouRatherCommand implements Command {
  readonly data = new SlashCommandBuilder()
    .setName('wyr')
    .setDescription('Generate a "Would you rather..." question')

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const question = await llm.generate()

    await interaction.editReply({
      poll: {
        question: { text: 'Tu préférerais...' },
        answers: [
          { text: question.optionA.slice(0, 55) },
          { text: question.optionB.slice(0, 55) },
        ],
        allowMultiselect: false,
        duration: 1, // in hours
        layoutType: PollLayoutType.Default,
      },
    })
  }
}

export default new WouldYouRatherCommand()
