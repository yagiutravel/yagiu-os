import type {
  TourChecklistCompletionRow,
  TourChecklistTemplateRow,
  TourChecklistTemplateUpdate,
} from "@/types/database";
import type {
  CreateChecklistTemplateInput,
  TourChecklistCompletion,
  TourChecklistTemplate,
  UpdateChecklistTemplateInput,
} from "@/types/tour-checklist";

export function mapChecklistTemplateRowToTemplate(
  row: TourChecklistTemplateRow,
): TourChecklistTemplate {
  return {
    id: row.id,
    tourId: row.tour_id,
    codice: row.codice,
    etichetta: row.etichetta,
    descrizione: row.descrizione,
    ordine: row.ordine,
    obbligatorio: row.obbligatorio,
  };
}

export function mapChecklistCompletionRowToCompletion(
  row: TourChecklistCompletionRow,
): TourChecklistCompletion {
  return {
    id: row.id,
    tourId: row.tour_id,
    templateId: row.template_id,
    participantId: row.participant_id,
    completato: row.completato,
    completatoIl: row.completato_il,
    note: row.note,
  };
}

export function mapCreateChecklistTemplateToInsert(
  input: CreateChecklistTemplateInput,
  organizationId: string,
) {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    codice: input.codice.trim(),
    etichetta: input.etichetta.trim(),
    descrizione: input.descrizione?.trim() ?? "",
    ordine: input.ordine ?? 0,
    obbligatorio: input.obbligatorio ?? true,
  };
}

export function mapUpdateChecklistTemplateToUpdate(
  input: UpdateChecklistTemplateInput,
): TourChecklistTemplateUpdate {
  const payload: TourChecklistTemplateUpdate = {};

  if (input.etichetta !== undefined) payload.etichetta = input.etichetta.trim();
  if (input.descrizione !== undefined) {
    payload.descrizione = input.descrizione.trim();
  }
  if (input.ordine !== undefined) payload.ordine = input.ordine;
  if (input.obbligatorio !== undefined) payload.obbligatorio = input.obbligatorio;

  return payload;
}

export const DEFAULT_CHECKLIST_TEMPLATES: Array<{
  codice: string;
  etichetta: string;
  descrizione: string;
  ordine: number;
  obbligatorio: boolean;
}> = [
  {
    codice: "contratto",
    etichetta: "Contratto firmato",
    descrizione: "Contratto di partecipazione firmato dal viaggiatore.",
    ordine: 1,
    obbligatorio: true,
  },
  {
    codice: "documenti_identita",
    etichetta: "Documenti identità ricevuti",
    descrizione: "Passaporto o carta d'identità validi.",
    ordine: 2,
    obbligatorio: true,
  },
  {
    codice: "assicurazione",
    etichetta: "Assicurazione verificata",
    descrizione: "Polizza viaggio attiva e copertura confermata.",
    ordine: 3,
    obbligatorio: true,
  },
  {
    codice: "acconto",
    etichetta: "Acconto ricevuto",
    descrizione: "Primo pagamento registrato.",
    ordine: 4,
    obbligatorio: true,
  },
  {
    codice: "saldo",
    etichetta: "Saldo ricevuto",
    descrizione: "Pagamento finale completato.",
    ordine: 5,
    obbligatorio: true,
  },
  {
    codice: "voucher",
    etichetta: "Voucher inviato",
    descrizione: "Documentazione di viaggio consegnata al partecipante.",
    ordine: 6,
    obbligatorio: false,
  },
];
