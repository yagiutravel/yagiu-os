import type { ClienteQuestionario } from "@/types/cliente-questionario";

export function createClienteQuestionarioId(): string {
  return `cquest-${crypto.randomUUID()}`;
}

export function formatQuestionarioValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
}

export function formatBooleanLabel(value: boolean): string {
  return value ? "Sì" : "No";
}

export function createClienteQuestionario(
  clienteId: string,
  data: Omit<
    ClienteQuestionario,
    "id" | "clienteId" | "creatoIl" | "aggiornatoIl"
  >,
): ClienteQuestionario {
  const now = new Date().toISOString();

  return {
    id: createClienteQuestionarioId(),
    clienteId,
    ...data,
    creatoIl: now,
    aggiornatoIl: now,
  };
}

export const EMPTY_QUESTIONARIO_DISPLAY = "—";
