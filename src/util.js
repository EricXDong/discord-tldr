import { verifyKey } from "discord-interactions";
import fetch from "node-fetch";

/// Copied from https://github.com/discord/discord-example-app/blob/main/utils.js

export function verifyDiscordRequest(clientKey) {
  return (req, res, buf, _) => {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}

export function discordRequest(endpoint, options) {
  // Append endpoint to root API URL
  const url = "https://discord.com/api/v9/" + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  return fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    ...options,
  });
}
