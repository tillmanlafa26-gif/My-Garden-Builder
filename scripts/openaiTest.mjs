import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY env var. Copy .env.example to .env and set your key.");
}

const client = new OpenAI({ apiKey });

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "write a haiku about ai",
});

console.log(response.output_text);