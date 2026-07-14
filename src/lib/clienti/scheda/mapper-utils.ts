/**
 * Utility condivise per i mapper della scheda cliente.
 */

import { EMPTY_DISPLAY } from "@/models/cliente-scheda/defaults";

export function toDisplayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : EMPTY_DISPLAY;
}

export function toNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toPlainString(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.split("T")[0];
}

export function toIsoDateTime(value: string): string {
  return value.includes("T") ? value : `${value}T00:00:00.000Z`;
}

export function isEmptyDisplay(value: string): boolean {
  return value === EMPTY_DISPLAY || value.trim() === "";
}

export function displayToPlain(value: string): string {
  return isEmptyDisplay(value) ? "" : value;
}

export function generateLocalId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
