import Head from "next/head";
import { useRef } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <Head>
        <title>Humanloop Test</title>
      </Head>
      <main>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (inputRef.current) {
              const input = inputRef.current.value;

              console.log(input);

              const response = await fetch("/api/edge-streaming", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: input,
              });

              console.log(response);

              if (!response.body) throw Error();

              const decoder = new TextDecoder();
              const reader = response.body.getReader();
              let done = false;
              while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                console.log(decoder.decode(value));
              }
              console.log("finished streaming");
            }
          }}
        >
          <input defaultValue="Hello!" ref={inputRef} />
          <input name="Chat" type="submit" />
        </form>
      </main>
    </>
  );
}
