import type { BuildContextInput } from "../models/context";
import type { AiContext, AiContextSource } from "../models/context";

function createContextId(): string {
  return `ctx-${crypto.randomUUID()}`;
}

function inferSources(toolName: string, data: unknown): AiContextSource[] {
  if (!data || typeof data !== "object") {
    return [
      {
        type: "generale",
        id: "general",
        label: "Contesto generale",
        snippet: "Nessun dato strutturato disponibile",
      },
    ];
  }

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.items)) {
    return (record.items as Array<{ id?: string; label?: string; snippet?: string }>)
      .slice(0, 5)
      .map((item, index) => ({
        type: mapToolToSourceType(toolName),
        id: item.id ?? `item-${index}`,
        label: item.label ?? `Elemento ${index + 1}`,
        snippet: item.snippet ?? "",
      }));
  }

  return [
    {
      type: mapToolToSourceType(toolName),
      id: toolName,
      label: toolName,
      snippet: JSON.stringify(data).slice(0, 120),
    },
  ];
}

function mapToolToSourceType(
  toolName: string,
): AiContextSource["type"] {
  switch (toolName) {
    case "searchClients":
      return "cliente";
    case "searchTours":
      return "tour";
    case "searchPayments":
      return "pagamento";
    case "searchDocuments":
      return "documento";
    case "searchDashboard":
      return "dashboard";
    default:
      return "generale";
  }
}

/** Costruisce il contesto operativo a partire dalla richiesta e dal tool. */
export class ContextBuilder {
  build(input: BuildContextInput): AiContext {
    const { request, toolResult } = input;

    return {
      id: createContextId(),
      sessionId: request.sessionId ?? null,
      sources: inferSources(toolResult.tool, toolResult.data),
      summary: toolResult.summary,
      payload: {
        query: request.query,
        tool: toolResult.tool,
        data: toolResult.data,
      },
      builtAt: new Date().toISOString(),
    };
  }
}

export const contextBuilder = new ContextBuilder();
