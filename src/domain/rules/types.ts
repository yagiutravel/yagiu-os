import type { DomainSnapshot } from "@/domain/types/snapshot";
import type {
  OperationalAlert,
  RuleEvaluationContext,
} from "@/domain/types/alerts";

export type DomainRule = {
  id: string;
  description: string;
  evaluate: (
    snapshot: DomainSnapshot,
    context: RuleEvaluationContext,
  ) => OperationalAlert[];
};
