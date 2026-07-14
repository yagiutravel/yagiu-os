import type { Cliente } from "@/types/cliente";
import { isWithinLastDays, daysSince } from "./date";

export function isClienteAttivo(cliente: Cliente): boolean {
  return cliente.stato === "Attivo";
}

export function isClienteInattivo(cliente: Cliente): boolean {
  return cliente.stato === "Inattivo";
}

export function isClienteProspect(cliente: Cliente): boolean {
  return cliente.stato === "Prospect";
}

export function isNuovoCliente(
  cliente: Cliente,
  days = 7,
  now = new Date(),
): boolean {
  return isWithinLastDays(cliente.creatoIl, days, now);
}

export function isClienteInattivoDaLungoPeriodo(
  cliente: Cliente,
  days = 365,
  now = new Date(),
): boolean {
  return isClienteInattivo(cliente) && daysSince(cliente.creatoIl, now) > days;
}

export function sortClientiByName(clienti: Cliente[]): Cliente[] {
  return [...clienti].sort((a, b) => a.nome.localeCompare(b.nome, "it"));
}
