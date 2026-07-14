import type { BuildPromptInput } from "../models/prompt";
import type { AiPrompt } from "../models/prompt";

export const AI_SYSTEM_PROMPT = `Sei l'assistente operativo di Yagiu OS.
Rispondi in italiano in modo professionale e conciso.
Usa esclusivamente i dati forniti nel contesto.`;

export const AI_PROVIDER_CONFIG = {
  provider: "mock" as const,
  model: "gpt-4o",
  maxTokens: 4096,
  temperature: 0.7,
} as const;

function createPromptId(): string {
  return `prompt-${crypto.randomUUID()}`;
}

/** Assembla il prompt — nessun invio al provider in questa fase. */
export class PromptBuilder {
  build(input: BuildPromptInput): AiPrompt {
    const { request, context, toolResult } = input;

    return {
      id: createPromptId(),
      system: AI_SYSTEM_PROMPT,
      user: request.query,
      contextSnapshot: {
        contextId: context.id,
        summary: context.summary,
        sources: context.sources,
        tool: toolResult.tool,
        toolSummary: toolResult.summary,
        toolData: toolResult.data,
      },
      metadata: {
        provider: AI_PROVIDER_CONFIG.provider,
        model: AI_PROVIDER_CONFIG.model,
        temperature: AI_PROVIDER_CONFIG.temperature,
        maxTokens: AI_PROVIDER_CONFIG.maxTokens,
      },
      createdAt: new Date().toISOString(),
    };
  }
}

export const promptBuilder = new PromptBuilder();
