export type AiToolName =
  | "searchClients"
  | "searchTours"
  | "searchPayments"
  | "searchDashboard"
  | "searchDocuments";

export type AiToolInput = {
  query: string;
  arguments?: Record<string, unknown>;
};

export type AiToolResult<T = unknown> = {
  tool: AiToolName;
  success: boolean;
  data: T;
  summary: string;
};

/** Contratto base per ogni tool AI. */
export interface AiTool<T = unknown> {
  readonly name: AiToolName;
  readonly description: string;
  execute(input: AiToolInput): Promise<AiToolResult<T>>;
}
