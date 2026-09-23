import dotenv from "dotenv";
dotenv.config();

export const config = {
  token: process.env.DISCORD_BOT_TOKEN || "",
  clientId: process.env.DISCORD_CLIENT_ID || "",
  guildId: process.env.DISCORD_GUILD_ID || "",
  
  // Channels
  appChannelId: process.env.DISCORD_APPLICATION_CHANNEL_ID || "",
  approvedChannelId: process.env.DISCORD_APPROVED_CHANNEL_ID || "",
  rejectedChannelId: process.env.DISCORD_REJECTED_CHANNEL_ID || "",
  
  // Roles
  verifiedRoleId: process.env.DISCORD_VERIFIED_ROLE_ID || "",
  staffRoleId: process.env.DISCORD_STAFF_ROLE_ID || "",
  adminRoleId: process.env.DISCORD_ADMIN_ROLE_ID || "",
  silverRoleId: process.env.DISCORD_SILVER_ROLE_ID || "",
  goldRoleId: process.env.DISCORD_GOLD_ROLE_ID || "",
  emeraldRoleId: process.env.DISCORD_EMERALD_ROLE_ID || "",
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  
  // Website URL
  websiteUrl: process.env.WEBSITE_URL || "http://localhost:3000",
};

export const isBotConfigured = () => {
  return Boolean(config.token && config.token !== "your-discord-bot-token");
};
