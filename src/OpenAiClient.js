import { OpenAIApi, Configuration } from "openai";

export class OpenAiClient {
  constructor() {
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_TOKEN,
    });

    this.client = new OpenAIApi(this.configuration);
  }

  createCompletion(prompt, temperature) {
    return this.client
      .createCompletion({
        model: "text-davinci-002",
        prompt,
        temperature,
        max_tokens: 50,
        stop: [".", "!", "?"],
      })
      .catch((err) => {
        console.err("Error sending request to OpenAI");
        console.err(err);
      });
  }
}
