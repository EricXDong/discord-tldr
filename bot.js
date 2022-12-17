import { InteractionResponseType, InteractionType } from 'discord-interactions';
import express from 'express';
import { verifyDiscordRequest } from './util.js';
import * as dotenv from 'dotenv';
import { installCommands } from './commands.js';

// Load .env file
dotenv.config();

// Initialize server
const app = express()
const PORT = 3000;

// Parse request body and verify incoming requests
app.use(express.json({ verify: verifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/interactions', (req, res) => {
    const { type, id, data } = req.body;

    console.log(`Received command: ${type}`);

    // Handle verification requests
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;

        console.log(`Command name: ${name}`);

        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'Talk to the hand nerd'
            }
        });
    }
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);

    installCommands(process.env.APP_ID, process.env.GUILD_ID);
});