import type {
  CreateSchedulazioneInput,
  Schedulazione,
  SchedulazioneForm,
  SchedulazioneFormErrors,
} from "@/types/schedulazione";

export const EMPTY_SCHEDULAZIONE_FORM: SchedulazioneForm = {
  titolo: "",
  clienteId: "",
  tourId: "",
  tipo: "email",
  data: "",
  ora: "09:00",
  stato: "programmata",
};

export function createSchedulazioneId(): string {
  return `sched-${crypto.randomUUID()}`;
}

export function createSchedulazione(
  input: CreateSchedulazioneInput,
): Schedulazione {
  const now = new Date().toISOString();
  return {
    id: createSchedulazioneId(),
    ...input,
    creatoIl: now,
    aggiornatoIl: now,
  };
}

export function formatSchedulazioneDataOra(data: string, ora: string): string {
  const combined = new Date(`${data}T${ora}`);
  if (Number.isNaN(combined.getTime())) return "—";

  return combined.toLocaleString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortSchedulazioni(
  items: Schedulazione[],
): Schedulazione[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(`${a.data}T${a.ora}`).getTime();
    const dateB = new Date(`${b.data}T${b.ora}`).getTime();
    return dateB - dateA;
  });
}

export function validateSchedulazioneForm(
  form: SchedulazioneForm,
): SchedulazioneFormErrors {
  const errors: SchedulazioneFormErrors = {};

  if (!form.titolo.trim()) errors.titolo = "Il titolo è obbligatorio.";
  if (!form.clienteId) errors.clienteId = "Seleziona un cliente.";
  if (!form.data) errors.data = "La data è obbligatoria.";
  if (!form.ora) errors.ora = "L'ora è obbligatoria.";

  return errors;
}

export function hasSchedulazioneFormErrors(
  errors: SchedulazioneFormErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

export function countByStato(
  items: Schedulazione[],
): Record<string, number> {
  return {
    programmata: items.filter((i) => i.stato === "programmata").length,
    inviata: items.filter((i) => i.stato === "inviata").length,
    fallita: items.filter((i) => i.stato === "fallita").length,
    bozza: items.filter((i) => i.stato === "bozza").length,
  };
}
