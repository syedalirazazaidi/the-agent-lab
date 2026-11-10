import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { validatePrompt } from "./validation";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemini-3.5-flash-lite";

async function main() {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    const rawPrompt = await rl.question("Enter your prompt: ");
    const result = validatePrompt(rawPrompt);

    if (!result.success) {
      console.log("Validation failed:");
      result.error.issues.forEach((issue) => {
        console.log(`- ${issue.message}`);
      });
      return;
    }

    const prompt = result.data.prompt;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    console.log("\nAI Response:\n" + (response.text ?? "No response returned."));
  } catch (error) {
    console.error("LLM request failed:", error);
  } finally {
    rl.close();
  }
}

main();