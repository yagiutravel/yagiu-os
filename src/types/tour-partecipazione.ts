import type { ClienteStato } from "@/types/cliente";
import type { TourStato } from "@/types/tour";

export type RuoloPartecipante =
  | "Partecipante"
  | "Tour Leader"
  | "Accompagnatore"
  | "Guida Locale";

export type PagamentoPartecipante =
  | "Non iniziato"
  | "Acconto ricevuto"
  | "Saldo ricevuto";

export type DocumentiPartecipante =
  | "Da inviare"
  | "Ricevuti"
  | "Verificati";

export type QuestionarioPartecipante =
  | "Da compilare"
  | "Compilato";

export type PartecipazioneTour = {
  id: string;
  tourId: string;
  clienteId: string;
  ruolo: RuoloPartecipante;
  pagamento: PagamentoPartecipante;
  documenti: DocumentiPartecipante;
  questionario: QuestionarioPartecipante;
  note: string;
  creatoIl: string;
  aggiornatoIl: string;
};

export type CreatePartecipazioneTourInput = {
  tourId: string;
  clienteId: string;
  ruolo: RuoloPartecipante;
  pagamento: PagamentoPartecipante;
  documenti: DocumentiPartecipante;
  questionario: QuestionarioPartecipante;
  note?: string;
};

export type UpdatePartecipazioneTourInput = Partial<
  Omit<CreatePartecipazioneTourInput, "tourId" | "clienteId">
>;

export type PartecipazioneTourView = PartecipazioneTour & {
  clienteNome: string;
  clienteEmail: string;
  clienteStato: ClienteStato;
};

export type TourClienteView = {
  partecipazioneId: string;
  tourId: string;
  nomeTour: string;
  destinazione: string;
  anno: number;
  ruolo: RuoloPartecipante;
  statoTour: TourStato;
};

export type PartecipanteForm = {
  clienteId: string;
  ruolo: RuoloPartecipante;
  pagamento: PagamentoPartecipante;
  documenti: DocumentiPartecipante;
  questionario: QuestionarioPartecipante;
  note: string;
};
