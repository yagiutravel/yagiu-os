import type { AiPrompt } from "../models/prompt";

export type AiProviderConfig = {
  name: "openai";
  model: string;
  apiKeyEnvVar: string;
};

export type LlmCompletionResult = {
  content: string;
  model: string;
  provider: "openai";
};

export type LlmProvider = {
  readonly config: AiProviderConfig;
  complete(prompt: AiPrompt): Promise<LlmCompletionResult>;
};
