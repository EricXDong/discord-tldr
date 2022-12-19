import { InteractionResponseType } from "discord-interactions";
import date from "date-and-time";

import { discordRequest } from "./util.js";
import { OpenAiClient } from "./OpenAiClient.js";

const COMMAND_NAMES = {
  HI: "hi",
  TLDR: "tldr",
  TEST: "test",
};

export class DiscordCommands {
  constructor() {
    this.openAi = new OpenAiClient();

    // For editing guild commands
    this.COMMAND_ENDPOINT = `applications/${process.env.APP_ID}/guilds/${process.env.GUILD_ID}/commands`;

    // Command types come from:
    // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
    this.commands = [
      {
        name: COMMAND_NAMES.HI,
        description: "Friendly neighborhood hello",
        type: 1,
      },
      {
        name: COMMAND_NAMES.TLDR,
        description: "Summarize recent messages",
        options: [
          {
            // INTEGER
            type: 4,
            name: "hours",
            description: "How many hours of message history to summarize",
            required: false,
            min_value: 1,
            max_value: 24,
          },
        ],
        type: 1,
      },
      {
        name: COMMAND_NAMES.TEST,
        description: "Just a test",
        type: 1,
      },
    ];
  }

  async runCommand(reqBody, response) {
    const channelId = reqBody.channel_id;
    const { name, options } = reqBody.data;

    // Respond to the same channel that the interaction came from
    const respondWithMessage = (msg) =>
      response.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: msg,
        },
      });

    switch (name) {
      case COMMAND_NAMES.HI: {
        let completion = await this.openAi.createCompletion(
          "Pretend you are someone saying hello to a friend you have not seen in many years",
          0.8
        );

        return respondWithMessage(completion.data.choices[0].text);
      }

      case COMMAND_NAMES.TLDR: {
        let numHours = 1;
        if (options) {
          let hourOption = options.find((option) => option.name === "hours");

          numHours = hourOption ? hourOption.value : numHours;
        }

        let responseMsg = await this.runTldrCommand(channelId, numHours);
        return respondWithMessage(responseMsg);
      }

      case COMMAND_NAMES.TEST: {
        return respondWithMessage("Don't test me buddy");
      }

      default:
        return respondWithMessage("Unknown command");
    }
  }

  THE BOT CAN ONLY SEE IT'S OWN MESSAGE HISTORY

  async runTldrCommand(channelId, numHours) {
    console.log(`Summarizing messages from the last ${numHours} hours`);

    const MESSAGES_ENDPOINT = `/channels/${channelId}/messages`;
    const stopTime = date.addHours(new Date(), numHours * -1);

    let messages = await discordRequest(MESSAGES_ENDPOINT, {
      method: "GET",
    })
      .then(async (res) => res.json())
      .then((data) => {
        // Messages are returned in reverse chronological order
        data.forEach((msg) => {
          console.log(`Message: ${msg.content}`);
          console.log(`Time: ${msg.timestamp}\n`);
        });

        let lastMsgIdx = data.findIndex((msg) => {
          let msgDate = new Date(Date.parse(msg.timestamp));
          // First index where the message date is more than {numHours} hours
          // ago
          return msgDate < stopTime;
        });

        let messages = data.slice(0, lastMsgIdx);
        return messages.map((msg) => msg.content).join("-\n-");
      })
      .catch((err) => {
        console.error("Error fetching message history");
        console.error(err);
      });

    return "hi";
  }

  installCommands() {
    // No need to wait, can be run async.
    Promise.all(
      this.commands.map((command) =>
        discordRequest(this.COMMAND_ENDPOINT, {
          method: "POST",
          body: command,
        })
      )
    )
      .then(() => {
        console.log("Finished installing commands");
      })
      .catch((err) => {
        console.error("Error installing commands");
        console.error(err);
      });
  }
}
