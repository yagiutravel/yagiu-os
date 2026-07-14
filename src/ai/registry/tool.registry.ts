import type { AiTool, AiToolName } from "../models/tool";

export class ToolRegistry {
  private readonly tools = new Map<AiToolName, AiTool>();

  register(tool: AiTool): void {
    this.tools.set(tool.name, tool);
  }

  registerAll(tools: AiTool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  get(name: AiToolName): AiTool | undefined {
    return this.tools.get(name);
  }

  getOrThrow(name: AiToolName): AiTool {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool non registrato: ${name}`);
    }
    return tool;
  }

  list(): AiTool[] {
    return [...this.tools.values()];
  }

  listNames(): AiToolName[] {
    return [...this.tools.keys()];
  }
}

export function createToolRegistry(tools: AiTool[]): ToolRegistry {
  const registry = new ToolRegistry();
  for (const tool of tools) {
    registry.register(tool);
  }
  return registry;
}
