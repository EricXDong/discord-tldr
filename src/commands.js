import { discordRequest } from "./util.js";

// Command types come from: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
const commands = [
  {
    name: "hi",
    description: "Friendly neighborhood hello",
    type: 1,
  },
];

export async function installCommands(appId, guildId) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;

  Promise.all(
    commands.map((command) =>
      discordRequest(endpoint, {
        method: "POST",
        body: command,
      })
    )
  ).catch((err) => {
    console.error("Error installing commands");
    console.error(err);
  });
}
