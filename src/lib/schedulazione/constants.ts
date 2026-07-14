import type {
  SchedulazioneStato,
  SchedulazioneTipo,
} from "@/types/schedulazione";

export const SCHEDULAZIONE_STATO_FILTRI: Array<{
  value: SchedulazioneStato | "tutte";
  label: string;
}> = [
  { value: "tutte", label: "Tutte" },
  { value: "programmata", label: "Programmate" },
  { value: "inviata", label: "Inviate" },
  { value: "fallita", label: "Fallite" },
  { value: "bozza", label: "Bozze" },
];

export const SCHEDULAZIONE_TIPO_FILTRI: Array<{
  value: SchedulazioneTipo | "tutti";
  label: string;
}> = [
  { value: "tutti", label: "Tutti" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "reminder", label: "Reminder" },
];

export const SCHEDULAZIONE_STATO_LABELS: Record<SchedulazioneStato, string> = {
  programmata: "Programmata",
  inviata: "Inviata",
  fallita: "Fallita",
  bozza: "Bozza",
};

export const SCHEDULAZIONE_TIPO_LABELS: Record<SchedulazioneTipo, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  reminder: "Reminder",
};
