import { aiOrchestrator, AiOrchestrator } from "../orchestrator/ai.orchestrator";
import type { AiRequest, AiOrchestrationResult } from "../models/request";

export class AiCoreService {
  constructor(private readonly orchestrator: AiOrchestrator = aiOrchestrator) {}

  async processRequest(request: AiRequest): Promise<AiOrchestrationResult> {
    return this.orchestrator.handle(request);
  }
}

export const aiCoreService = new AiCoreService();
