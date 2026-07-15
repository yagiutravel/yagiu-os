import type { MetodoPagamento, TipoPagamento } from "@/types/pagamento";
import type { CategoriaDocumentoTour } from "@/types/tour-documento";
import type { TipologiaCamera } from "@/types/camera";
import type {
  DocumentiPartecipante,
  PagamentoPartecipante,
  QuestionarioPartecipante,
  RuoloPartecipante,
  StatoIscrizione,
} from "@/types/tour-partecipazione";
import type { TourStato } from "@/types/tour";

export type DbTourStato =
  | "bozza"
  | "in_vendita"
  | "completo"
  | "in_corso"
  | "terminato"
  | "archiviato";

export type DbRuoloPartecipante =
  | "partecipante"
  | "tour_leader"
  | "accompagnatore"
  | "guida_locale";

export type DbStatoIscrizione = "iscritto" | "lista_attesa" | "annullato";

export type DbTipologiaCamera = "singola" | "doppia" | "tripla" | "quadrupla";

export type DbPagamentoPartecipante =
  | "non_iniziato"
  | "acconto_ricevuto"
  | "saldo_ricevuto";

export type DbDocumentiPartecipante = "da_inviare" | "ricevuti" | "verificati";

export type DbQuestionarioPartecipante = "da_compilare" | "compilato";

const TOUR_STATO_TO_UI: Record<DbTourStato, TourStato> = {
  bozza: "Bozza",
  in_vendita: "In vendita",
  completo: "Completo",
  in_corso: "In corso",
  terminato: "Terminato",
  archiviato: "Archiviato",
};

const TOUR_STATO_TO_DB: Record<TourStato, DbTourStato> = {
  Bozza: "bozza",
  "In vendita": "in_vendita",
  Completo: "completo",
  "In corso": "in_corso",
  Terminato: "terminato",
  Archiviato: "archiviato",
};

const RUOLO_TO_UI: Record<DbRuoloPartecipante, RuoloPartecipante> = {
  partecipante: "Partecipante",
  tour_leader: "Tour Leader",
  accompagnatore: "Accompagnatore",
  guida_locale: "Guida Locale",
};

const RUOLO_TO_DB: Record<RuoloPartecipante, DbRuoloPartecipante> = {
  Partecipante: "partecipante",
  "Tour Leader": "tour_leader",
  Accompagnatore: "accompagnatore",
  "Guida Locale": "guida_locale",
};

const ISCRIZIONE_TO_UI: Record<DbStatoIscrizione, StatoIscrizione> = {
  iscritto: "Iscritto",
  lista_attesa: "Lista attesa",
  annullato: "Annullato",
};

const ISCRIZIONE_TO_DB: Record<StatoIscrizione, DbStatoIscrizione> = {
  Iscritto: "iscritto",
  "Lista attesa": "lista_attesa",
  Annullato: "annullato",
};

const TIPOLOGIA_TO_UI: Record<DbTipologiaCamera, TipologiaCamera> = {
  singola: "Singola",
  doppia: "Doppia",
  tripla: "Tripla",
  quadrupla: "Quadrupla",
};

const TIPOLOGIA_TO_DB: Record<TipologiaCamera, DbTipologiaCamera> = {
  Singola: "singola",
  Doppia: "doppia",
  Tripla: "tripla",
  Quadrupla: "quadrupla",
};

const PAGAMENTO_TO_UI: Record<DbPagamentoPartecipante, PagamentoPartecipante> = {
  non_iniziato: "Non iniziato",
  acconto_ricevuto: "Acconto ricevuto",
  saldo_ricevuto: "Saldo ricevuto",
};

const PAGAMENTO_TO_DB: Record<PagamentoPartecipante, DbPagamentoPartecipante> = {
  "Non iniziato": "non_iniziato",
  "Acconto ricevuto": "acconto_ricevuto",
  "Saldo ricevuto": "saldo_ricevuto",
};

const DOCUMENTI_TO_UI: Record<DbDocumentiPartecipante, DocumentiPartecipante> = {
  da_inviare: "Da inviare",
  ricevuti: "Ricevuti",
  verificati: "Verificati",
};

const DOCUMENTI_TO_DB: Record<DocumentiPartecipante, DbDocumentiPartecipante> = {
  "Da inviare": "da_inviare",
  Ricevuti: "ricevuti",
  Verificati: "verificati",
};

const QUESTIONARIO_TO_UI: Record<
  DbQuestionarioPartecipante,
  QuestionarioPartecipante
> = {
  da_compilare: "Da compilare",
  compilato: "Compilato",
};

const QUESTIONARIO_TO_DB: Record<
  QuestionarioPartecipante,
  DbQuestionarioPartecipante
> = {
  "Da compilare": "da_compilare",
  Compilato: "compilato",
};

export function mapDbTourStatoToUi(value: string): TourStato {
  return TOUR_STATO_TO_UI[value as DbTourStato] ?? "In vendita";
}

export function mapUiTourStatoToDb(value: TourStato): DbTourStato {
  return TOUR_STATO_TO_DB[value];
}

export function mapDbRuoloToUi(value: string): RuoloPartecipante {
  return RUOLO_TO_UI[value as DbRuoloPartecipante] ?? "Partecipante";
}

export function mapUiRuoloToDb(value: RuoloPartecipante): DbRuoloPartecipante {
  return RUOLO_TO_DB[value];
}

export function mapDbIscrizioneToUi(value: string): StatoIscrizione {
  return ISCRIZIONE_TO_UI[value as DbStatoIscrizione] ?? "Iscritto";
}

export function mapUiIscrizioneToDb(value: StatoIscrizione): DbStatoIscrizione {
  return ISCRIZIONE_TO_DB[value];
}

export function mapDbTipologiaToUi(value: string): TipologiaCamera {
  return TIPOLOGIA_TO_UI[value as DbTipologiaCamera] ?? "Doppia";
}

export function mapUiTipologiaToDb(value: TipologiaCamera): DbTipologiaCamera {
  return TIPOLOGIA_TO_DB[value];
}

export function mapDbPagamentoToUi(value: string): PagamentoPartecipante {
  return PAGAMENTO_TO_UI[value as DbPagamentoPartecipante] ?? "Non iniziato";
}

export function mapUiPagamentoToDb(
  value: PagamentoPartecipante,
): DbPagamentoPartecipante {
  return PAGAMENTO_TO_DB[value];
}

export function mapDbDocumentiToUi(value: string): DocumentiPartecipante {
  return DOCUMENTI_TO_UI[value as DbDocumentiPartecipante] ?? "Da inviare";
}

export function mapUiDocumentiToDb(
  value: DocumentiPartecipante,
): DbDocumentiPartecipante {
  return DOCUMENTI_TO_DB[value];
}

export function mapDbQuestionarioToUi(value: string): QuestionarioPartecipante {
  return QUESTIONARIO_TO_UI[value as DbQuestionarioPartecipante] ?? "Da compilare";
}

export function mapUiQuestionarioToDb(
  value: QuestionarioPartecipante,
): DbQuestionarioPartecipante {
  return QUESTIONARIO_TO_DB[value];
}

export type DbMetodoPagamento = "bonifico" | "carta" | "contanti";
export type DbTipoPagamento = "acconto" | "saldo";
export type DbCategoriaDocumentoTour =
  | "contratto"
  | "assicurazione"
  | "programma"
  | "voucher"
  | "fattura"
  | "immagine"
  | "altro";

const METODO_PAGAMENTO_TO_UI: Record<DbMetodoPagamento, MetodoPagamento> = {
  bonifico: "Bonifico",
  carta: "Carta",
  contanti: "Contanti",
};

const METODO_PAGAMENTO_TO_DB: Record<MetodoPagamento, DbMetodoPagamento> = {
  Bonifico: "bonifico",
  Carta: "carta",
  Contanti: "contanti",
};

const TIPO_PAGAMENTO_TO_UI: Record<DbTipoPagamento, TipoPagamento> = {
  acconto: "Acconto",
  saldo: "Saldo",
};

const TIPO_PAGAMENTO_TO_DB: Record<TipoPagamento, DbTipoPagamento> = {
  Acconto: "acconto",
  Saldo: "saldo",
};

const CATEGORIA_DOCUMENTO_TO_UI: Record<
  DbCategoriaDocumentoTour,
  CategoriaDocumentoTour
> = {
  contratto: "Contratto",
  assicurazione: "Assicurazione",
  programma: "Programma",
  voucher: "Voucher",
  fattura: "Fattura",
  immagine: "Immagine",
  altro: "Altro",
};

const CATEGORIA_DOCUMENTO_TO_DB: Record<
  CategoriaDocumentoTour,
  DbCategoriaDocumentoTour
> = {
  Contratto: "contratto",
  Assicurazione: "assicurazione",
  Programma: "programma",
  Voucher: "voucher",
  Fattura: "fattura",
  Immagine: "immagine",
  Altro: "altro",
};

export function mapDbMetodoPagamentoToUi(value: string): MetodoPagamento {
  return METODO_PAGAMENTO_TO_UI[value as DbMetodoPagamento] ?? "Bonifico";
}

export function mapUiMetodoPagamentoToDb(
  value: MetodoPagamento,
): DbMetodoPagamento {
  return METODO_PAGAMENTO_TO_DB[value];
}

export function mapDbTipoPagamentoToUi(value: string): TipoPagamento {
  return TIPO_PAGAMENTO_TO_UI[value as DbTipoPagamento] ?? "Acconto";
}

export function mapUiTipoPagamentoToDb(value: TipoPagamento): DbTipoPagamento {
  return TIPO_PAGAMENTO_TO_DB[value];
}

export function mapDbCategoriaDocumentoToUi(
  value: string,
): CategoriaDocumentoTour {
  return CATEGORIA_DOCUMENTO_TO_UI[value as DbCategoriaDocumentoTour] ?? "Altro";
}

export function mapUiCategoriaDocumentoToDb(
  value: CategoriaDocumentoTour,
): DbCategoriaDocumentoTour {
  return CATEGORIA_DOCUMENTO_TO_DB[value];
}
