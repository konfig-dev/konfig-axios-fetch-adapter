import axios from "axios";
import fetchAdapter from "./index";

window["axios"] = axios;
window.onload = async function () {
  try {
    const data = await axios.request({
      url: "/package.json",
      method: "get",
      adapter: fetchAdapter,
    });
    document.getElementById("app")?.append(JSON.stringify(data, null, 4));
  } catch (e) {
    console.log(e);
  }
};
const formElem = document.getElementById("formElem");
if (formElem && formElem instanceof HTMLFormElement) {
  formElem.onsubmit = async (e) => {
    e.preventDefault();

    let response = await axios.request({
      url: "https://httpbin.org/post",
      method: "post",
      data: new FormData(formElem),
      adapter: fetchAdapter,
    });

    console.log(response);
  };
}

const chatForm = document.getElementById("chat-gpt");
const chatInput = document.getElementById("chat-input");
if (chatForm && chatInput && chatInput instanceof HTMLInputElement) {
  chatForm.onsubmit = async (e) => {
    e.preventDefault();

    const input = {
      model: { id: "gpt-3.5-turbo", name: "GPT-3.5" },
      systemPrompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
      messages: [
        {
          role: "user",
          content: chatInput.value,
        },
      ],
    };

    const res = await axios.post(
      `https://api.openai.com/v1/chat/completions`,
      JSON.stringify({
        model: input.model.id,
        messages: [
          {
            role: "system",
            content: input.systemPrompt,
          },
          ...input.messages,
        ],
        max_tokens: 1000,
        temperature: 1,
        stream: true,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        adapter: fetchAdapter,
      }
    );

    console.log(res.data);
  };
}
