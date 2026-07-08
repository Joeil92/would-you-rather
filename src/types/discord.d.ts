import type { ChatInputCommandInteraction } from 'discord.js'
import type { Command } from './command.types.js'

interface Command {
  data: { name: string }
  execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void
}

declare module 'discord.js' {
  interface Client {
    commands: Command[]
  }
}
