import { InteractionResponseType, InteractionType } from "discord-interactions";
import express from "express";
import { verifyDiscordRequest } from "./util.js";
import * as dotenv from "dotenv";
import { DiscordCommands } from "./DiscordCommands.js";

// Load .env file
dotenv.config();

// Initialize server
const app = express();
const PORT = 3000;

const discordCommands = new DiscordCommands();

// Parse request body and verify incoming requests
app.use(express.json({ verify: verifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post("/interactions", async (req, res) => {
  const { type } = req.body;

  // Handle verification requests
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Handle slash commands
  if (type === InteractionType.APPLICATION_COMMAND) {
    discordCommands.runCommand(req.body, res);
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);

  discordCommands.installCommands();
});
