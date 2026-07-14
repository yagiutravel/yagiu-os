import type { AiRequest } from "./request";
import type { AiToolResult } from "./tool";

export type AiContextSourceType =
  | "cliente"
  | "tour"
  | "pagamento"
  | "documento"
  | "dashboard"
  | "generale";

export type AiContextSource = {
  type: AiContextSourceType;
  id: string;
  label: string;
  snippet: string;
};

/** Contesto operativo costruito dai risultati tool. */
export type AiContext = {
  id: string;
  sessionId: string | null;
  sources: AiContextSource[];
  summary: string;
  payload: Record<string, unknown>;
  builtAt: string;
};

export type BuildContextInput = {
  request: AiRequest;
  toolResult: AiToolResult;
};
