import type { TourStato } from "@/types/tour";

export type MetodoPagamento = "Bonifico" | "Carta" | "Contanti";

export type TipoPagamento = "Acconto" | "Saldo";

export type StatoPagamentoPartecipante =
  | "Da pagare"
  | "Acconto versato"
  | "Saldo completato";

/** Record pagamento — pronto per tabella Supabase `pagamenti`. */
export type Pagamento = {
  id: string;
  tourId: string;
  partecipazioneId: string;
  importo: number;
  data: string;
  metodo: MetodoPagamento;
  tipo: TipoPagamento;
  creatoIl: string;
  aggiornatoIl: string;
};

export type CreatePagamentoInput = {
  tourId: string;
  partecipazioneId: string;
  importo: number;
  data: string;
  metodo: MetodoPagamento;
  tipo: TipoPagamento;
};

export type UpdatePagamentoInput = Partial<
  Omit<CreatePagamentoInput, "tourId" | "partecipazioneId">
>;

export type PagamentoForm = {
  importo: string;
  data: string;
  metodo: MetodoPagamento;
  tipo: TipoPagamento;
};

export type PartecipantePagamentoView = {
  partecipazioneId: string;
  clienteId: string;
  clienteNome: string;
  quotaTotale: number;
  accontoVersato: number;
  saldoVersato: number;
  importoResiduo: number;
  statoPagamento: StatoPagamentoPartecipante;
  pagamenti: Pagamento[];
};

export type TourPagamentiRiepilogo = {
  totaleTour: number;
  incassato: number;
  residuoDaIncassare: number;
  clientiPagati: number;
  clientiSaldoAperto: number;
};

export type TourPagamentiData = {
  partecipanti: PartecipantePagamentoView[];
  riepilogo: TourPagamentiRiepilogo;
};

export type ClienteTourPagamentoView = {
  tourId: string;
  nomeTour: string;
  destinazione: string;
  anno: number;
  statoTour: TourStato;
  partecipante: PartecipantePagamentoView;
};

export type ClientePagamentiRiepilogo = {
  totaleVersato: number;
  importoResiduo: number;
  numeroPagamenti: number;
  tourConSaldoAperto: number;
};

export type ClientePagamentiData = {
  perTour: ClienteTourPagamentoView[];
  riepilogo: ClientePagamentiRiepilogo;
};

/** Shape Supabase `tour_payments`. */
export type PagamentoRow = {
  id: string;
  tour_id: string;
  participant_id: string;
  importo_cents: number;
  data: string;
  metodo: string;
  tipo: string;
  created_at: string;
  updated_at: string;
};
