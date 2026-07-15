export function formatQuestionarioValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
}

export function formatBooleanLabel(value: boolean): string {
  return value ? "Sì" : "No";
}

export const EMPTY_QUESTIONARIO_DISPLAY = "—";
