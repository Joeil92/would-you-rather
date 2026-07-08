import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Collection } from 'discord.js'
import type { Command } from '../types/command.types.js'
import type { Logger } from 'winston'

export class CommandLoader {
  constructor(private readonly logger: Logger) {}

  /**
   * Load commands from the commands folder.
   *
   * @param dir - Directory to load commands from
   *
   * @returns Collection of commands
   */
  async load(dir?: string): Promise<Collection<string, Command>> {
    const commands = new Collection<string, Command>()
    const dirname = path.dirname(fileURLToPath(import.meta.url))
    const commandsPath = dir ?? path.join(dirname, '..', 'commands')

    const files = fs
      .readdirSync(commandsPath)
      .filter((f) => f.endsWith('.js') || f.endsWith('.ts'))

    for (const file of files) {
      const filePath = path.join(commandsPath, file)
      const mod = await import(pathToFileURL(filePath).href)
      const command: unknown = mod.default ?? mod

      if (this.isCommand(command)) {
        commands.set(command.data.name, command)
      } else {
        this.logger.warn(
          `Command at ${filePath} is missing "data" or "execute".`
        )
      }
    }

    return commands
  }

  private isCommand(value: unknown): value is Command {
    return (
      typeof value === 'object' &&
      value !== null &&
      'data' in value &&
      'execute' in value
    )
  }
}
