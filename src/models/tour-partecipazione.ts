import type {
  CreatePartecipazioneTourInput,
  DocumentiPartecipante,
  PagamentoPartecipante,
  PartecipanteForm,
  PartecipazioneTour,
  QuestionarioPartecipante,
  RuoloPartecipante,
} from "@/types/tour-partecipazione";

export const RUOLO_PARTECIPANTE_OPTIONS: { value: RuoloPartecipante; label: string }[] = [
  { value: "Partecipante", label: "Partecipante" },
  { value: "Tour Leader", label: "Tour Leader" },
  { value: "Accompagnatore", label: "Accompagnatore" },
  { value: "Guida Locale", label: "Guida Locale" },
];

export const PAGAMENTO_PARTECIPANTE_OPTIONS: {
  value: PagamentoPartecipante;
  label: string;
}[] = [
  { value: "Non iniziato", label: "Non iniziato" },
  { value: "Acconto ricevuto", label: "Acconto ricevuto" },
  { value: "Saldo ricevuto", label: "Saldo ricevuto" },
];

export const DOCUMENTI_PARTECIPANTE_OPTIONS: {
  value: DocumentiPartecipante;
  label: string;
}[] = [
  { value: "Da inviare", label: "Da inviare" },
  { value: "Ricevuti", label: "Ricevuti" },
  { value: "Verificati", label: "Verificati" },
];

export const QUESTIONARIO_PARTECIPANTE_OPTIONS: {
  value: QuestionarioPartecipante;
  label: string;
}[] = [
  { value: "Da compilare", label: "Da compilare" },
  { value: "Compilato", label: "Compilato" },
];

export const EMPTY_PARTECIPANTE_FORM: PartecipanteForm = {
  clienteId: "",
  ruolo: "Partecipante",
  pagamento: "Non iniziato",
  documenti: "Da inviare",
  questionario: "Da compilare",
  note: "",
};

export function createPartecipazioneId(): string {
  return `part-${crypto.randomUUID()}`;
}

export function createPartecipazioneTour(
  input: CreatePartecipazioneTourInput,
): PartecipazioneTour {
  const now = new Date().toISOString();

  return {
    id: createPartecipazioneId(),
    tourId: input.tourId,
    clienteId: input.clienteId,
    ruolo: input.ruolo,
    pagamento: input.pagamento,
    documenti: input.documenti,
    questionario: input.questionario,
    note: input.note?.trim() ?? "",
    creatoIl: now,
    aggiornatoIl: now,
  };
}

export function partecipazioneToForm(
  partecipazione: PartecipazioneTour,
): PartecipanteForm {
  return {
    clienteId: partecipazione.clienteId,
    ruolo: partecipazione.ruolo,
    pagamento: partecipazione.pagamento,
    documenti: partecipazione.documenti,
    questionario: partecipazione.questionario,
    note: partecipazione.note,
  };
}

export function formToCreateInput(
  tourId: string,
  form: PartecipanteForm,
): CreatePartecipazioneTourInput {
  return {
    tourId,
    clienteId: form.clienteId,
    ruolo: form.ruolo,
    pagamento: form.pagamento,
    documenti: form.documenti,
    questionario: form.questionario,
    note: form.note,
  };
}
