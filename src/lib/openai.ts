import OpenAI from "openai";

export function createOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY_LOCAL });
}
