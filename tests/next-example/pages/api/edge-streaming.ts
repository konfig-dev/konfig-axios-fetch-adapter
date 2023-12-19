// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import fetchAdapter from "../../../../dist/index";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  const input = await req.text();
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
        { role: "user", content: input },
      ],
    },
  });
  return new Response(response.data);
}
