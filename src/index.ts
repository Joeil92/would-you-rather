import 'dotenv/config'
import { Client, GatewayIntentBits, Events } from 'discord.js'
import logger from './utils/logger.utils.js'

async function main(): Promise<void> {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] })

  client.on(Events.ClientReady, (client) => {
    logger.info(`Logged in as ${client.user.tag}!`)
  })

  client.login(process.env.DISCORD_TOKEN)
}

main().catch(console.error)
