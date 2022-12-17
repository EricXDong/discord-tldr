import { discordRequest } from "./util.js";
import { InteractionType } from 'discord-interactions';

export async function installCommands(appId, guildId) {
    // API endpoint to get and post guild commands
    const endpoint = `applications/${appId}/guilds/${guildId}/commands`;

    try {
        const res = await discordRequest(endpoint, { method: 'GET' });
        const data = await res.json();

        if (data) {
            console.log('Installing command /test');
            const r = await discordRequest(endpoint, {
                method: 'POST',
                body: {
                    name: 'test',
                    description: 'Test command',
                    // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
                    type: 1
                }
            });

            console.log(await r.json());
        }
    } catch (err) {
        console.error('Error installing commands');
        console.error(err);
    }
}