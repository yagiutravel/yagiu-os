import type { AiContext } from "./context";
import type { AiRequest } from "./request";
import type { AiToolResult } from "./tool";

/** Prompt assemblato — pronto per provider LLM futuro, non inviato in questa fase. */
export type AiPrompt = {
  id: string;
  system: string;
  user: string;
  contextSnapshot: Record<string, unknown>;
  metadata: AiPromptMetadata;
  createdAt: string;
};

export type AiPromptMetadata = {
  provider: "mock" | "openai";
  model: string;
  temperature: number;
  maxTokens: number;
};

export type BuildPromptInput = {
  request: AiRequest;
  context: AiContext;
  toolResult: AiToolResult;
};
