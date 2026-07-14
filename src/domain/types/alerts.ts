export type AlertSeverity = "critical" | "warning" | "info" | "success";

export type AlertEntityType =
  | "tour"
  | "cliente"
  | "partecipazione"
  | "camera"
  | "pagamento"
  | "documento";

export type OperationalAlert = {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  entityType: AlertEntityType;
  entityId: string;
  message: string;
  tourId?: string;
  clienteId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type RuleEvaluationContext = {
  now: Date;
};
