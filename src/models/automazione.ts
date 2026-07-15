import type {
  Automazione,
  AutomazioneForm,
  AutomazioneFormErrors,
} from "@/types/automazione";

export const EMPTY_AUTOMAZIONE_FORM: AutomazioneForm = {
  nome: "",
  trigger: "",
  azione: "",
  stato: "attivo",
};

export function formatAutomazioneUltimaEsecuzione(
  value: string | null,
): string {
  if (!value) return "Mai eseguito";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortAutomazioni(items: Automazione[]): Automazione[] {
  return [...items].sort((a, b) => {
    const dateA = a.ultimaEsecuzione
      ? new Date(a.ultimaEsecuzione).getTime()
      : 0;
    const dateB = b.ultimaEsecuzione
      ? new Date(b.ultimaEsecuzione).getTime()
      : 0;
    return dateB - dateA;
  });
}

export function validateAutomazioneForm(
  form: AutomazioneForm,
): AutomazioneFormErrors {
  const errors: AutomazioneFormErrors = {};

  if (!form.nome.trim()) errors.nome = "Il nome è obbligatorio.";
  if (!form.trigger) errors.trigger = "Seleziona un trigger.";
  if (!form.azione) errors.azione = "Seleziona un'azione.";

  return errors;
}

export function hasAutomazioneFormErrors(
  errors: AutomazioneFormErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

export function countByStato(items: Automazione[]): Record<string, number> {
  return {
    attivo: items.filter((i) => i.stato === "attivo").length,
    inattivo: items.filter((i) => i.stato === "inattivo").length,
    bozza: items.filter((i) => i.stato === "bozza").length,
  };
}
