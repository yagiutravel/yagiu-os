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

/** Shape prevista per Supabase — non collegata ancora. */
export type PagamentoRow = {
  id: string;
  tour_id: string;
  partecipazione_id: string;
  importo: number;
  data: string;
  metodo: MetodoPagamento;
  tipo: TipoPagamento;
  creato_il: string;
  aggiornato_il: string;
};
