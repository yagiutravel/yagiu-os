import type { ClienteForm, ClienteStato } from "@/types/cliente";

export const PAGE_SIZE = 5;

export const STATO_OPTIONS: { value: ClienteStato; label: string }[] = [
  { value: "Prospect", label: "Prospect" },
  { value: "Attivo", label: "Attivo" },
  { value: "Inattivo", label: "Inattivo" },
];

export const STATO_FILTER_OPTIONS: { value: ClienteStato | "tutti"; label: string }[] = [
  { value: "tutti", label: "Tutti" },
  ...STATO_OPTIONS,
];

export const SORT_OPTIONS = [
  { value: "nome-asc", label: "Nome A → Z", field: "nome" as const, direction: "asc" as const },
  { value: "nome-desc", label: "Nome Z → A", field: "nome" as const, direction: "desc" as const },
  { value: "creatoIl-desc", label: "Più recenti", field: "creatoIl" as const, direction: "desc" as const },
  { value: "creatoIl-asc", label: "Meno recenti", field: "creatoIl" as const, direction: "asc" as const },
];

export const EMPTY_CLIENTE_FORM: ClienteForm = {
  nome: "",
  email: "",
  telefono: "",
  azienda: "",
  stato: "Prospect",
};
