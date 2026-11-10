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
    const rawRole = await rl.question(
      "Choose role (teacher / developer / interviewer): "
    );

    const result = validatePrompt(rawPrompt, rawRole);

    if (!result.success) {
      console.log("Validation failed:");
      result.error.issues.forEach((issue) => {
        console.log(`- ${issue.message}`);
      });
      return;
    }

    const { prompt, role } = result.data;

    const systemInstruction = {
      teacher: "You are a helpful teacher. Explain concepts clearly and step by step.",
      developer:
        "You are a senior developer. Give practical, technical, and concise advice.",
      interviewer:
        "You are an interview coach. Ask smart follow-up questions and guide the user clearly.",
    }[role];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    console.log("\nAI Response:\n" + (response.text ?? "No response returned."));
  } catch (error) {
    console.error("LLM request failed:", error);
  } finally {
    rl.close();
  }
}

main();