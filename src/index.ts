import 'dotenv/config'
import { Client as Discord, GatewayIntentBits } from 'discord.js'
import { config } from './config/config.service.js'
import logger from './lib/winston.js'
import { CommandLoader } from './lib/command-loader.js'
import { Bot } from './client.js'

async function main(): Promise<void> {
  const client = new Discord({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessageReactions,
    ],
  })
  const loader = new CommandLoader(logger)
  const bot = new Bot(client, loader, logger)

  await bot.start(config.get('DISCORD_TOKEN'))
}

main().catch((error) => {
  logger.error('Fatal error during startup:', error)
  process.exit(1)
})
