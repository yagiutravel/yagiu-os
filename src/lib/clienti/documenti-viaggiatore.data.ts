import type { DocumentiViaggiatore } from "@/types/documenti-viaggiatore";

export function getDocumentiViaggiatorePlaceholder(
  clienteId: string,
): DocumentiViaggiatore {
  return {
    documenti: [
      {
        id: `${clienteId}-doc-pp`,
        tipo: "passaporto",
        nome: "Passaporto IT · YA4829103",
        stato: "valido",
        dataScadenza: "2031-03-15",
      },
      {
        id: `${clienteId}-doc-as`,
        tipo: "assicurazione",
        nome: "Polizza viaggio World Cover",
        stato: "in_scadenza",
        dataScadenza: "2026-08-20",
      },
      {
        id: `${clienteId}-doc-vi`,
        tipo: "visto",
        nome: "Visto USA ESTA",
        stato: "valido",
        dataScadenza: "2027-01-10",
      },
      {
        id: `${clienteId}-doc-li`,
        tipo: "liberatoria",
        nome: "Liberatoria attività Trekking",
        stato: "scaduto",
        dataScadenza: "2025-05-05",
      },
    ],
  };
}

export function formatDocumentoScadenza(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
