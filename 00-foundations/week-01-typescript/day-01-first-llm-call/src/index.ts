
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
  const response = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: "Explain what an AI agent is in simple English with one practical example.",
  });

  console.log(response.output_text);
}

main().catch(console.error);