# Ask OpenAI CLI

CLI for using OpenAI models in terminal.

Heavily inspired by:
* Swyx's `ask-cli` [(his implementation)](https://github.com/sw-yx/ask-cli)
* Linus' prototype [(his implementation)](https://gist.github.com/thesephist/28786aa80ac6e26241116c5ed2be97ca)

I couldn't get the Linus' to work and Swyx's is too complex for my needs, so I made my own.

## How to use

0. Get an API key from OpenAI.
1. Save your API key with `export OPENAI_API_KEY=your_key`.
2. Build the project with `npm run build`.
3. Move the `ask` file to your `PATH` (e.g. `/usr/local/bin`) with `mv build/ask /usr/local/bin`.
4. Run `ask` to get a prompt.
