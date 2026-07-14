import type {
  AiMemoryEntry,
  AiMemorySnapshot,
  AiSessionMemory,
  RecordMemoryInput,
} from "../models/memory";
import type { AiContext } from "../models/context";

function createMemoryEntryId(): string {
  return `mem-${crypto.randomUUID()}`;
}

/** Memoria di sessione in-memory — pronta per persistenza futura. */
export class MemoryStore {
  private readonly sessions = new Map<string, AiSessionMemory>();
  private readonly globalEntries: AiMemoryEntry[] = [];

  record(input: RecordMemoryInput): AiMemoryEntry {
    const { result } = input;
    const sessionId = result.request.sessionId ?? null;

    const entry: AiMemoryEntry = {
      id: createMemoryEntryId(),
      sessionId,
      query: result.request.query,
      selectedTool: result.selectedTool,
      toolResult: result.toolResult,
      contextId: result.context.id,
      createdAt: result.processedAt,
    };

    if (sessionId) {
      const existing = this.sessions.get(sessionId) ?? {
        sessionId,
        entries: [],
        updatedAt: result.processedAt,
      };
      existing.entries.push(entry);
      existing.updatedAt = result.processedAt;
      this.sessions.set(sessionId, existing);
    } else {
      this.globalEntries.push(entry);
    }

    return entry;
  }

  getSession(sessionId: string): AiSessionMemory | null {
    return this.sessions.get(sessionId) ?? null;
  }

  getSnapshot(sessionId?: string): AiMemorySnapshot {
    if (sessionId) {
      const session = this.sessions.get(sessionId);
      const lastEntry = session?.entries[session.entries.length - 1];
      return {
        sessionId,
        entries: session?.entries ?? [],
        lastContext: lastEntry
          ? ({ id: lastEntry.contextId } as AiContext)
          : null,
      };
    }

    return {
      sessionId: null,
      entries: [...this.globalEntries],
      lastContext: null,
    };
  }

  clear(): void {
    this.sessions.clear();
    this.globalEntries.length = 0;
  }
}

export const memoryStore = new MemoryStore();
