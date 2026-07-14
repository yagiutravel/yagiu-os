import type { DomainSnapshot } from "@/domain/types/snapshot";
import type {
  OperationalAlert,
  RuleEvaluationContext,
} from "@/domain/types/alerts";
import type { DomainRule } from "./types";
import { DOMAIN_RULES } from "./rules";

export function evaluateRules(
  snapshot: DomainSnapshot,
  rules: DomainRule[] = DOMAIN_RULES,
  context: RuleEvaluationContext = { now: new Date() },
): OperationalAlert[] {
  return rules.flatMap((rule) => rule.evaluate(snapshot, context));
}

export function evaluateRuleById(
  snapshot: DomainSnapshot,
  ruleId: string,
  context: RuleEvaluationContext = { now: new Date() },
): OperationalAlert[] {
  const rule = DOMAIN_RULES.find((item) => item.id === ruleId);
  if (!rule) return [];
  return rule.evaluate(snapshot, context);
}

export function deduplicateAlerts(
  alerts: OperationalAlert[],
): OperationalAlert[] {
  const seen = new Set<string>();
  return alerts.filter((alert) => {
    if (seen.has(alert.id)) return false;
    seen.add(alert.id);
    return true;
  });
}

export function evaluateAllRules(
  snapshot: DomainSnapshot,
  context: RuleEvaluationContext = { now: new Date() },
): OperationalAlert[] {
  return deduplicateAlerts(evaluateRules(snapshot, DOMAIN_RULES, context));
}
