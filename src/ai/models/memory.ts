import type { AiContext } from "./context";
import type { AiOrchestrationResult } from "./request";
import type { AiToolResult } from "./tool";

export type AiMemoryEntry = {
  id: string;
  sessionId: string | null;
  query: string;
  selectedTool: string;
  toolResult: AiToolResult;
  contextId: string;
  createdAt: string;
};

export type AiMemorySnapshot = {
  sessionId: string | null;
  entries: AiMemoryEntry[];
  lastContext: AiContext | null;
};

export type AiSessionMemory = {
  sessionId: string;
  entries: AiMemoryEntry[];
  updatedAt: string;
};

export type RecordMemoryInput = {
  result: AiOrchestrationResult;
};
