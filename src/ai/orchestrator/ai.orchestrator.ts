import { contextBuilder } from "../context/context.builder";
import { promptBuilder } from "../context/prompt.builder";
import { memoryStore } from "../memory/memory.store";
import type { AiOrchestrationResult, AiRequest } from "../models/request";
import { toolPlanner } from "../planner/tool.planner";
import { createToolRegistry, type ToolRegistry } from "../registry/tool.registry";
import { createDefaultAiTools } from "../tools";

export type AiOrchestratorOptions = {
  registry?: ToolRegistry;
};

/** Punto unico di ingresso del motore AI. */
export class AiOrchestrator {
  private readonly registry: ToolRegistry;

  constructor(options: AiOrchestratorOptions = {}) {
    this.registry = options.registry ?? createToolRegistry(createDefaultAiTools());
  }

  async handle(request: AiRequest): Promise<AiOrchestrationResult> {
    const query = request.query.trim();
    if (!query) {
      throw new Error("La richiesta AI deve contenere una query non vuota.");
    }

    const selectedTool = toolPlanner.plan(query);
    const tool = this.registry.getOrThrow(selectedTool);

    const toolResult = await tool.execute({ query });

    const context = contextBuilder.build({ request, toolResult });
    const prompt = promptBuilder.build({ request, context, toolResult });

    const result: AiOrchestrationResult = {
      request,
      selectedTool,
      toolResult,
      context,
      prompt,
      status: toolResult.success ? "executed" : "failed",
      processedAt: new Date().toISOString(),
    };

    memoryStore.record({ result });

    return result;
  }

  listTools() {
    return this.registry.list();
  }
}

export const aiOrchestrator = new AiOrchestrator();
