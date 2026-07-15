"use server";

import { llmProvider } from "../providers/llm.provider";
import type { AiPrompt } from "../models/prompt";
import type { LlmCompletionResult } from "../providers/llm.provider.types";

export async function completeAiPrompt(
  prompt: AiPrompt,
): Promise<LlmCompletionResult> {
  return llmProvider.complete(prompt);
}
