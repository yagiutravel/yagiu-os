import type {
  ClienteTimelineEvento,
  ClienteTimelineEventoTipo,
} from "@/types/cliente-timeline";

export const CLIENTE_TIMELINE_EVENTO_LABELS: Record<
  ClienteTimelineEventoTipo,
  string
> = {
  cliente_creato: "Cliente creato",
  iscritto_tour: "Iscritto al Tour",
  pagamento: "Pagamento",
  documento_caricato: "Documento caricato",
  camera_assegnata: "Camera assegnata",
  email_inviata: "Email inviata",
  whatsapp_inviato: "WhatsApp inviato",
  checklist_completata: "Checklist completata",
  tour_concluso: "Tour concluso",
  preventivo_creato: "Preventivo creato",
  preventivo_inviato: "Preventivo inviato",
  preventivo_accettato: "Preventivo accettato",
  preventivo_convertito: "Iscrizione da preventivo",
};

export function sortTimelineEventi(
  eventi: ClienteTimelineEvento[],
): ClienteTimelineEvento[] {
  return [...eventi].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  );
}

export function formatTimelineData(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
