import type { TimelineEvento } from "@/types/timeline-viaggiatore";

export function getTimelineTourPlaceholder(tourId: string): TimelineEvento[] {
  const eventi: TimelineEvento[] = [
    {
      id: `${tourId}-tl-1`,
      tipo: "prenotazione",
      titolo: "Tour pubblicato",
      descrizione:
        "Scheda tour pubblicata sul catalogo Yagiu e resa disponibile per le prenotazioni online.",
      data: "2025-12-10T10:00:00.000Z",
    },
    {
      id: `${tourId}-tl-2`,
      tipo: "pagamento",
      titolo: "Acconto fornitore confermato",
      descrizione:
        "Registrato pagamento acconto del 30% verso partner hotel e trasporti locali.",
      data: "2026-01-15T14:30:00.000Z",
    },
    {
      id: `${tourId}-tl-3`,
      tipo: "documento_caricato",
      titolo: "Contratto hotel caricato",
      descrizione:
        "Contratto di soggiorno firmato e archiviato nella documentazione operativa del tour.",
      data: "2026-02-20T09:15:00.000Z",
    },
    {
      id: `${tourId}-tl-4`,
      tipo: "email_inviata",
      titolo: "Comunicazione pre-partenza inviata",
      descrizione:
        "Inviata email al gruppo con informazioni pratiche, lista bagaglio e contatti di emergenza.",
      data: "2026-03-28T16:00:00.000Z",
    },
    {
      id: `${tourId}-tl-5`,
      tipo: "nota_interna",
      titolo: "Checklist operativa aggiornata",
      descrizione:
        "Completate verifiche assicurazione, visti e assegnazione guide locali per tutte le tappe.",
      data: "2026-04-05T11:45:00.000Z",
    },
    {
      id: `${tourId}-tl-6`,
      tipo: "tour_completato",
      titolo: "Gruppo confermato",
      descrizione:
        "Raggiunta capienza minima. Tour confermato e pronto per la partenza.",
      data: "2026-04-08T08:30:00.000Z",
    },
  ];

  return eventi.sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  );
}
