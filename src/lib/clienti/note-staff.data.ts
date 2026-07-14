import type { NoteStaff } from "@/types/note-staff";

export function getNoteStaffPlaceholder(clienteId: string): NoteStaff {
  return {
    note: [
      {
        id: `${clienteId}-nota-1`,
        autore: "Marco Bianchi",
        data: "2026-07-12T09:15:00.000Z",
        contenuto:
          "Cliente molto motivato per il tour Giappone. Chiede aggiornamenti frequenti su itinerario e alloggi. Da tenere informato settimanalmente.",
      },
      {
        id: `${clienteId}-nota-2`,
        autore: "Sara Lombardi",
        data: "2026-07-05T14:30:00.000Z",
        contenuto:
          "Verificati documenti assicurativi e passaporto. Manca solo la liberatoria firmata per le attività trekking — sollecitare entro venerdì.",
      },
      {
        id: `${clienteId}-nota-3`,
        autore: "Martin Marangella",
        data: "2026-06-28T11:00:00.000Z",
        contenuto:
          "Preferenza camera singola confermata con l'hotel partner a Kyoto. Dieta vegetariana comunicata al ristorante del tour.",
      },
      {
        id: `${clienteId}-nota-4`,
        autore: "Sara Lombardi",
        data: "2026-06-20T16:45:00.000Z",
        contenuto:
          "Primo contatto post-prenotazione completato. Viaggiatore esperto, ha già fatto 3 tour con Yagiu in passato.",
      },
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
  };
}

export function formatNotaStaffData(isoDate: string): string {
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
