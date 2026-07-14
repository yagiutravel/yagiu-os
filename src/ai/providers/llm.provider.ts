import type { AiProviderConfig } from "./llm.provider.types";

/** Stub provider LLM — nessuna chiamata API. */
export type LlmProvider = {
  readonly config: AiProviderConfig;
  complete(_prompt: unknown): Promise<never>;
};

export const llmProvider: LlmProvider = {
  config: {
    name: "mock",
    model: "gpt-4o",
    apiKeyEnvVar: "OPENAI_API_KEY",
  },
  async complete() {
    throw new Error(
      "LLM provider non collegato. Integrazione OpenAI prevista in fase successiva.",
    );
  },
};
