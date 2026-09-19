import { Client, ActivityType, REST, Routes } from "discord.js";
import { config } from "../config";
import { visaStatusCommand } from "../commands/visaStatus";

export async function onReady(client: Client) {
  console.log(`[NOMIX BOT] ✅ Logged in successfully as ${client.user?.tag} (ID: ${client.user?.id})`);
  
  client.user?.setPresence({
    activities: [
      {
        name: "NOMIX Roleplay Visa Applications",
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });

  // Automatically register slash commands to the guild
  if (config.token && config.clientId) {
    try {
      const rest = new REST({ version: "10" }).setToken(config.token);
      const commands = [visaStatusCommand.data.toJSON()];

      if (config.guildId && config.guildId !== "your-discord-guild-id") {
        console.log(`[NOMIX BOT] Registering slash commands to Guild ID: ${config.guildId}...`);
        await rest.put(
          Routes.applicationGuildCommands(config.clientId, config.guildId),
          { body: commands }
        );
        console.log(`[NOMIX BOT] ✅ Successfully registered slash commands for guild.`);
      } else {
        console.log(`[NOMIX BOT] Registering global slash commands...`);
        await rest.put(
          Routes.applicationCommands(config.clientId),
          { body: commands }
        );
        console.log(`[NOMIX BOT] ✅ Successfully registered global slash commands.`);
      }
    } catch (err: any) {
      console.error("[NOMIX BOT] ⚠️ Error registering slash commands:", err.message);
    }
  }
}
