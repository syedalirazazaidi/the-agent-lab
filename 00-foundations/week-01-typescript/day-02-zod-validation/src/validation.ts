import { z } from "zod";

export const PromptSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3, "Prompt must be at least 3 characters long.")
    .max(500, "Prompt must be less than 500 characters."),
});

export type PromptInput = z.infer<typeof PromptSchema>;

export function validatePrompt(rawPrompt: string) {
  return PromptSchema.safeParse({ prompt: rawPrompt });
}
