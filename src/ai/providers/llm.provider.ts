import type { AiPrompt } from "../models/prompt";
import type {
  AiProviderConfig,
  LlmCompletionResult,
  LlmProvider,
} from "./llm.provider.types";

const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

function resolveApiKey(config: AiProviderConfig): string {
  const apiKey = process.env[config.apiKeyEnvVar];
  if (!apiKey?.trim()) {
    throw new Error(
      `${config.apiKeyEnvVar} non configurata. Aggiungi la chiave in .env.local.`,
    );
  }
  return apiKey.trim();
}

function buildUserMessage(prompt: AiPrompt): string {
  const contextJson = JSON.stringify(prompt.contextSnapshot, null, 2);
  return `${prompt.user}\n\nContesto dati:\n${contextJson}`;
}

async function completeWithOpenAI(prompt: AiPrompt): Promise<LlmCompletionResult> {
  const apiKey = resolveApiKey(llmProvider.config);

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: prompt.metadata.model,
      temperature: prompt.metadata.temperature,
      max_tokens: prompt.metadata.maxTokens,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: buildUserMessage(prompt) },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI API error (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI ha restituito una risposta vuota.");
  }

  return {
    content,
    model: prompt.metadata.model,
    provider: "openai",
  };
}

export const llmProvider: LlmProvider = {
  config: {
    name: "openai",
    model: "gpt-4o-mini",
    apiKeyEnvVar: "OPENAI_API_KEY",
  },
  complete: completeWithOpenAI,
};
