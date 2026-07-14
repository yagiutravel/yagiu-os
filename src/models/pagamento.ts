import type {
  CreatePagamentoInput,
  Pagamento,
  PagamentoForm,
  StatoPagamentoPartecipante,
  TipoPagamento,
} from "@/types/pagamento";

export const METODO_PAGAMENTO_OPTIONS: {
  value: PagamentoForm["metodo"];
  label: string;
}[] = [
  { value: "Bonifico", label: "Bonifico" },
  { value: "Carta", label: "Carta" },
  { value: "Contanti", label: "Contanti" },
];

export const TIPO_PAGAMENTO_OPTIONS: {
  value: TipoPagamento;
  label: string;
}[] = [
  { value: "Acconto", label: "Acconto" },
  { value: "Saldo", label: "Saldo" },
];

export const EMPTY_PAGAMENTO_FORM: PagamentoForm = {
  importo: "",
  data: new Date().toISOString().split("T")[0],
  metodo: "Bonifico",
  tipo: "Acconto",
};

export function createPagamentoId(): string {
  return `pay-${crypto.randomUUID()}`;
}

export function parsePrezzoTour(prezzo: string): number {
  const digits = prezzo.replace(/[^\d]/g, "");
  const value = Number.parseInt(digits, 10);
  return Number.isNaN(value) ? 0 : value;
}

export function createPagamento(input: CreatePagamentoInput): Pagamento {
  const now = new Date().toISOString();

  return {
    id: createPagamentoId(),
    tourId: input.tourId,
    partecipazioneId: input.partecipazioneId,
    importo: input.importo,
    data: input.data,
    metodo: input.metodo,
    tipo: input.tipo,
    creatoIl: now,
    aggiornatoIl: now,
  };
}

export function pagamentoToForm(pagamento: Pagamento): PagamentoForm {
  return {
    importo: String(pagamento.importo),
    data: pagamento.data,
    metodo: pagamento.metodo,
    tipo: pagamento.tipo,
  };
}

export function formToCreateInput(
  tourId: string,
  partecipazioneId: string,
  form: PagamentoForm,
): CreatePagamentoInput {
  return {
    tourId,
    partecipazioneId,
    importo: Number.parseFloat(form.importo),
    data: form.data,
    metodo: form.metodo,
    tipo: form.tipo,
  };
}

export function calcolaStatoPagamento(
  quotaTotale: number,
  accontoVersato: number,
  saldoVersato: number,
): StatoPagamentoPartecipante {
  const totaleVersato = accontoVersato + saldoVersato;

  if (totaleVersato <= 0) return "Da pagare";
  if (totaleVersato >= quotaTotale) return "Saldo completato";
  return "Acconto versato";
}

export function calcolaImportoResiduo(
  quotaTotale: number,
  accontoVersato: number,
  saldoVersato: number,
): number {
  return Math.max(quotaTotale - accontoVersato - saldoVersato, 0);
}

export function formatImportoPagamento(importo: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(importo);
}
