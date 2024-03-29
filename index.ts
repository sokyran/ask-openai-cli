import packageJson from "./package.json" with { type: "json" };
import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";

type Options = {
  number: number;
  temperature: number;
  topP: number;
  max: number;
  model: string;
  debug: boolean;
  stream: boolean;
};

await new Command()
  .name("ask")
  .version(packageJson.version)
  .description("Generate answers using OpenAI's GPT-3 API")
  .option("-n, --number <number:number>", "Number of completions to generate", { default: 1 })
  .option("-t, --temperature <temperature:number>", "Temperature for output sampling", { default: 0.4 })
  .option("--top-p <top-p:number>", "top_p value for nucleus sampling", { default: 0.9 })
  .option("--max <max:number>", "Max number of tokens to generate", { default: 512 })
  .option("--model <model:string>", "Model to use", { default: "gpt-4-turbo-preview" })
  .option("--stream [stream:boolean]", "Stream output", { default: false })
  .option("--debug [debug:boolean]", "Enable debug mode", { default: true })
  .arguments("<...prompt:string>")
  .action((options, ...promptArg) => makeRequest(promptArg, options))
  .parse(Deno.args);

async function makeRequest(prompt: string[], options: Options) {
  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
  };
  const body = {
    model: options.model,
    messages: [
      {"role": "system", "content": "You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible."},
      {"role": "user", "content": prompt.join(" ")},
    ],
    max_tokens: options.max,
    temperature: options.temperature,
    top_p: options.topP,
    n: options.number,
    stream: options.stream,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!Deno.env.get("OPENAI_API_KEY")) {
    console.log("Error: OPENAI_API_KEY is not set!\n");

    return;
  }

  if (options.debug) {
    console.log("Current model:", options.model, "\n");
  }

  if (!options.stream) {
    const json = await response.json();
    console.log(json.choices[0].message.content);

    return;
  }

  const reader = response.body?.getReader();
  const textDecoder = new TextDecoder();
  const textEncoder = new TextEncoder();

  // deno-lint-ignore no-explicit-any
  const processText = ({ done, value }: ReadableStreamDefaultReadResult<Uint8Array>): any => {
    if (done) {
      console.log("\n");
      return;
    }

    const jsonString = textDecoder.decode(value);

    // In request, there might be multiple jsons, like "data: {} \n data: {}"
    // Also we filter out "data: [DONE]]"
    const vaildJsons = jsonString.split('\n')
      .filter((part) => part.length > 0 && part !== 'data: [DONE]')
      .map((part) => part.replace('data: ', ''));

    vaildJsons.forEach((jsonString) => {
      try {
        const json = JSON.parse(jsonString);
  
        if (json?.choices[0]?.delta?.content && json.choices[0].delta.content.length > 0) {
          Deno.stdout.write(textEncoder.encode(json.choices[0].delta.content));
        }
      } catch(err) {
        throw new Error(`Failed to parse json: ${jsonString}\n${err}`);
      }
    });

    return reader?.read().then(processText);
  }

  reader?.read().then(processText);
}
