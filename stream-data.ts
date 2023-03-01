// deno-lint-ignore-file no-explicit-any
export function streamData(res: any) {
  try {
    res.data.on('data', (data: any) => {
      const lines = data.toString().split('\n').filter((line: string) => line.trim() !== '');
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(message);
          Deno.stdout.write(new TextEncoder().encode(parsed.choices[0].text));
        } catch(error) {
          console.error('Could not JSON parse stream message', message, error);
        }
      }
    });
} catch (error) {
    if (error.response?.status) {
      console.error(error.response.status, error.message);
      error.response.data.on('data', (data: any) => {
        const message = data.toString();
        try {
          const parsed = JSON.parse(message);
          console.error('An error occurred during OpenAI request: ', parsed);
        } catch {
          console.error('An error occurred during OpenAI request: ', message);
        }
      });
    } else {
      console.error('An error occurred during OpenAI request', error);
    }
  }
}
