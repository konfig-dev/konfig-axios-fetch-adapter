import { Injectable } from '@nestjs/common';
import axios from "axios"
import fetchAdapter from "konfig-axios-fetch-adapter"
import { ChatMessage, Humanloop } from 'humanloop';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {


    // axios.create({
    //   // @ts-ignore
    //   adapter: fetchAdapter
    // })


    const humanloop = new Humanloop({
      apiKey: process.env.HUMANLOOP_API_KEY,
      basePath: "https://neostaging.humanloop.ml/v4",
      openaiApiKey: process.env.OPENAI_API_KEY,
    });

    const response = await humanloop.chatStream({
      project: "konfig-dev-001",
      messages: [
        {
          role: "system",
          content:
            "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
        },
        { role: "user", content: "Write me a country song" },
      ],
      model_config: {
        model: "gpt-3.5-turbo",
        max_tokens: 1000,
        temperature: 1,
      },
    });

    const decoder = new TextDecoder();
    const reader = response.data.getReader();
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      console.log(decoder.decode(value));
    }

    return 'Hello!';
  }
}
