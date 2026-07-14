import type { AiToolName } from "../models/tool";

type PlannerRule = {
  tool: AiToolName;
  patterns: RegExp[];
  weight: number;
};

const PLANNER_RULES: PlannerRule[] = [
  {
    tool: "searchClients",
    patterns: [/client|viaggiator|iscritt|anagraf/i],
    weight: 2,
  },
  {
    tool: "searchTours",
    patterns: [
      /tour|partenz|settimana|parte|nepal|himalaya|destinazion/i,
    ],
    weight: 3,
  },
  {
    tool: "searchPayments",
    patterns: [/pagament|saldo|pagare|incass|accont/i],
    weight: 3,
  },
  {
    tool: "searchDocuments",
    patterns: [/document|passaport|assicuraz|liberator|mancan/i],
    weight: 3,
  },
  {
    tool: "searchDashboard",
    patterns: [
      /dashboard|kpi|riepilogo|disponibil|posti|capienz|occupaz/i,
    ],
    weight: 2,
  },
];

const DEFAULT_TOOL: AiToolName = "searchDashboard";

/** Seleziona il tool più adatto in base alla richiesta naturale. */
export class ToolPlanner {
  plan(query: string): AiToolName {
    const normalized = query.trim();
    if (!normalized) return DEFAULT_TOOL;

    const scores = new Map<AiToolName, number>();

    for (const rule of PLANNER_RULES) {
      const matched = rule.patterns.some((pattern) => pattern.test(normalized));
      if (!matched) continue;

      scores.set(rule.tool, (scores.get(rule.tool) ?? 0) + rule.weight);
    }

    if (scores.size === 0) return DEFAULT_TOOL;

    return [...scores.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
}

export const toolPlanner = new ToolPlanner();
