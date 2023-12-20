import { test } from "vitest";
import { Humanloop } from "humanloop";

test("force throw error", async () => {
  const humanloop = new Humanloop({
    basePath: "http://127.0.0.1:3000",
    apiKey: "TEST",
  });
  const response = await humanloop.complete({
    model_config: {
      model: "test",
      prompt_template: "",
    },
  });
  console.log(response);
});
