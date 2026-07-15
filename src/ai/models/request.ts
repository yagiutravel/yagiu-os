import type { AiContext } from "./context";
import type { AiPrompt } from "./prompt";
import type { AiToolResult } from "./tool";

/** Richiesta in ingresso all'orchestrator. */
export type AiRequest = {
  query: string;
  sessionId?: string;
  userId?: string;
  locale?: string;
};

export type AiOrchestrationStatus = "planned" | "executed" | "failed";

/** Risultato dell'orchestrazione con risposta LLM quando disponibile. */
export type AiOrchestrationResult = {
  request: AiRequest;
  selectedTool: string;
  toolResult: AiToolResult;
  context: AiContext;
  prompt: AiPrompt;
  response?: string;
  status: AiOrchestrationStatus;
  processedAt: string;
};
