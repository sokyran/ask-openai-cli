import { Command } from "https://deno.land/x/cliffy@v0.25.5/command/mod.ts";

type Options = {
  number: number | string;
  temperature: number | string;
  topP: number | string;
  max: number | string;
};

await new Command()
  .name("ask")
  .version("0.0.1")
  .description("Generate answers using OpenAI's GPT-3 API")
  .option("-n, --number <number>", "Number of completions to generate", { default: 1 })
  .option("-t, --temperature <temperature>", "Temperature for output sampling", { default: 1.0 })
  .option("--top-p <top-p>", "top_p value for nucleus sampling", { default: 0.9 })
  .option("--max <max>", "Max number of tokens to generate", { default: 256 })
  .arguments("<prompt:string>")
  .action(async (options, promptArg) => {
    const data = await makeRequest(promptArg, options);

    console.log(data);
  })
  .parse(Deno.args);

async function makeRequest(prompt: string, options: Options) {
  const url = "https://api.openai.com/v1/completions";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
  };
  const body = {
    prompt,
    model: 'text-davinci-002',
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

  return data.choices[0].text.trim();
}

