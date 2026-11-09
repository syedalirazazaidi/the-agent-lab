import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey });

// Swapped to an alternative active flash model
const MODEL = "gemini-3.5-flash-lite";

async function main() {
  const idea = "I learned TypeScript today";
  console.log(`Sending request to Gemini using model: ${MODEL}...`);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Write a LinkedIn post about: ${idea}`,
    config: {
      systemInstruction:
        "You write short, clear LinkedIn posts for a MERN developer.",
    },
  });

  console.log("\n--- Response ---");
  console.log(response.text);
  console.log("\nToken usage:", response.usageMetadata);
}

main().catch((error) => {
  console.error("LLM request failed:", error);
});