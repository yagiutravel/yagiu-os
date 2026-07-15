import type { AiContext } from "./context";
import type { AiRequest } from "./request";
import type { AiToolResult } from "./tool";

/** Prompt assemblato per il provider LLM. */
export type AiPrompt = {
  id: string;
  system: string;
  user: string;
  contextSnapshot: Record<string, unknown>;
  metadata: AiPromptMetadata;
  createdAt: string;
};

export type AiPromptMetadata = {
  provider: "openai";
  model: string;
  temperature: number;
  maxTokens: number;
};

export type BuildPromptInput = {
  request: AiRequest;
  context: AiContext;
  toolResult: AiToolResult;
};
