import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";

type Options = {
  number: number;
  temperature: number;
  topP: number;
  max: number;
};

await new Command()
  .name("ask")
  .version("0.0.1")
  .description("Generate answers using OpenAI's GPT-3 API")
  .option("-n, --number <number:number>", "Number of completions to generate", { default: 1 })
  .option("-t, --temperature <temperature:number>", "Temperature for output sampling", { default: 0.4 })
  .option("--top-p <top-p:number>", "top_p value for nucleus sampling", { default: 0.9 })
  .option("--max <max:number>", "Max number of tokens to generate", { default: 512 })
  .arguments("<prompt:string>")
  .action(async (options, promptArg) => {
    const data = await makeRequest(promptArg, options);

    console.log(`\n${data.trim('\n')}`);
  })
  .parse(Deno.args);

async function makeRequest(prompt: string, options: Options) {
  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
  };
  const body = {
    model: 'gpt-3.5-turbo',
    messages: [
      {"role": "system", "content": "You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible."},
      {"role": "user", "content": prompt},
    ],
    max_tokens: options.max,
    temperature: options.temperature,
    top_p: options.topP,
    n: options.number,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.error) {
    return data.error.message;
  }

  return data.choices[0].message.content.trim('\n');
}
