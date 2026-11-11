import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemini-3.5-flash-lite";

async function askGemini(question: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: question,
  });

  return response.text ?? "No response";
}

async function main() {
  try {
    console.time("Sequential execution");

    const js = await askGemini("Explain JavaScript in simple English.");
    console.log("JavaScript:", js);

    const node = await askGemini("Explain Node.js in simple English.");
    console.log("Node.js:", node);

    const ts = await askGemini("Explain TypeScript in simple English.");
    console.log("TypeScript:", ts);

    console.timeEnd("Sequential execution");
  } catch (error) {
    console.error("Something went wrong:", error);
  }
}

main();