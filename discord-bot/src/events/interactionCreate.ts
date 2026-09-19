import { Interaction } from "discord.js";
import { handleButtonInteraction } from "../interactions/buttonHandler";
import { handleModalSubmit } from "../interactions/modalHandler";
import { visaStatusCommand } from "../commands/visaStatus";

export async function onInteractionCreate(interaction: Interaction) {
  try {
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
    } else if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "visa-status") {
        await visaStatusCommand.execute(interaction);
      }
    }
  } catch (err: any) {
    console.error("[EVENT ERROR] Interaction handling error:", err);

    const errorMessage = `⚠️ **Error executing action**: ${err?.message || "Internal bot error."}`;

    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: errorMessage }).catch(console.error);
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true }).catch(console.error);
      }
    }
  }
}
