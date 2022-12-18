import { InteractionResponseType, InteractionType } from "discord-interactions";
import express from "express";
import { verifyDiscordRequest } from "./util.js";
import * as dotenv from "dotenv";
import { installCommands } from "./commands.js";
import { OpenAiClient } from "./OpenAiClient.js";

// Load .env file
dotenv.config();

// Initialize server
const app = express();
const PORT = 3000;

const openAi = new OpenAiClient();

// Parse request body and verify incoming requests
app.use(express.json({ verify: verifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post("/interactions", async (req, res) => {
  const { type, id, data } = req.body;

  // Respond to the same channel that the interaction came from
  const respondWithMessage = (msg) =>
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: msg,
      },
    });

  // Handle verification requests
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Handle slash commands
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    switch (name) {
      case "hi":
        const completion = await openAi.createCompletion(
          "Pretend you are someone saying hello to a long lost friend",
          0.8
        );

        return respondWithMessage(completion.data.choices[0].text);

      case "test":
        return respondWithMessage("Don't test me buddy");

      default:
        return respondWithMessage("Unknown command");
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);

  installCommands(process.env.APP_ID, process.env.GUILD_ID);
});
