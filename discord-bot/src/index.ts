import { Client, GatewayIntentBits, Partials, Events } from "discord.js";
import { config, isBotConfigured } from "./config";
import { onReady } from "./events/ready";
import { onInteractionCreate } from "./events/interactionCreate";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, () => onReady(client));
client.on("interactionCreate", onInteractionCreate);

if (isBotConfigured()) {
  client.login(config.token).catch((err) => {
    console.error("[NOMIX BOT] Failed to login with Discord Bot Token:", err.message);
  });
} else {
  console.log("[NOMIX BOT] Running in standalone offline/dev mode. Provide DISCORD_BOT_TOKEN in .env to connect to live Discord gateway.");
}

export { client };
