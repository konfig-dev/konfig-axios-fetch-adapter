import axios from "axios";
import fetchAdapter from "./index";
import { EventSourceParseCallback, createParser } from "eventsource-parser";

it("post request", async () => {
  const ax = axios.create({
    adapter: fetchAdapter,
  });
  let response = await ax.request({
    url: "https://httpbin.org/post",
    method: "post",
    data: { hello: "world" },
    adapter: fetchAdapter,
  });

  expect(JSON.parse(response.data.data)).toStrictEqual({ hello: "world" });
});

it("stream openai", async () => {
  const ax = axios.create({
    adapter: fetchAdapter,
  });
  let response = await ax.request({
    url: "https://api.openai.com/v1/chat/completions",
    method: "post",
    responseType: "stream",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    data: {
      stream: true,
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" },
      ],
    },
    adapter: fetchAdapter,
  });
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const onParse: EventSourceParseCallback = (event) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      const reader = response.data.getReader();
      let done = false;
      while (!done) {
        const { value: chunk, done: doneReading } = await reader.read();
        done = doneReading;
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  const reader = stream.getReader();
  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    console.log(decoder.decode(value));
  }

  console.log("Stream finished");
}, 20000);
