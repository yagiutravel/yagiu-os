import type { TourStato } from "@/types/tour";

export type DashboardSalutoPeriodo = "mattina" | "pomeriggio" | "sera";

export type DashboardGreeting = {
  saluto: string;
  nome: string;
  attivitaRichiedonoAttenzione: number;
};

export type DashboardTourInPartenza = {
  tourId: string;
  nomeTour: string;
  destinazione: string;
  dataPartenza: string;
  giorniMancanti: number;
  stato: TourStato;
};

export type DashboardPagamenti = {
  accontiMancanti: number;
  saldiMancanti: number;
  importoTotaleDaIncassare: number;
};

export type DashboardDocumenti = {
  passaportiMancanti: number;
  questionariMancanti: number;
  assicurazioniMancanti: number;
  liberatorieMancanti: number;
};

export type DashboardCamere = {
  camereComplete: number;
  camereIncomplete: number;
  postiDisponibili: number;
  overbooking: number;
  tourIdPrioritario: string | null;
};

export type DashboardViaggiatoreIscritto = {
  partecipazioneId: string;
  clienteId: string;
  nome: string;
  tourNome: string;
  tourId: string;
};

export type DashboardCompleanno = {
  clienteId: string;
  nome: string;
  giorno: number;
};

export type DashboardViaggiatori = {
  nuoviClienti: number;
  ultimiIscritti: DashboardViaggiatoreIscritto[];
  compleanniDelMese: DashboardCompleanno[];
  clientiInattivi: number;
};

export type DashboardAttivitaTipo =
  | "tour"
  | "documento"
  | "pagamento"
  | "camera"
  | "cliente"
  | "partecipante"
  | "preventivo";

export type DashboardPreventivi = {
  inAttesa: number;
  accettati: number;
  valoreTotaleInAttesa: number;
};

export type DashboardAttivita = {
  id: string;
  tipo: DashboardAttivitaTipo;
  ora: string;
  descrizione: string;
  href?: string;
};

export type DashboardKpi = {
  clienti: number;
  tour: number;
  partecipanti: number;
  camere: number;
  postiOccupati: number;
  postiDisponibili: number;
  percentualeOccupazioneMedia: number;
};

export type DashboardCalendarioEventoTipo =
  | "partenza"
  | "rientro"
  | "scadenza"
  | "attivita";

export type DashboardCalendarioEvento = {
  id: string;
  data: string;
  tipo: DashboardCalendarioEventoTipo;
  titolo: string;
};

export type DashboardCalendario = {
  mese: number;
  anno: number;
  eventi: DashboardCalendarioEvento[];
};

export type DashboardAvvisoLivello =
  | "critico"
  | "attenzione"
  | "avviso"
  | "info"
  | "success";

export type DashboardAvviso = {
  id: string;
  livello: DashboardAvvisoLivello;
  emoji: string;
  messaggio: string;
  href: string;
};

export type DashboardSearchResultTipo = "cliente" | "tour" | "partecipante";

export type DashboardSearchResult = {
  tipo: DashboardSearchResultTipo;
  id: string;
  titolo: string;
  sottotitolo: string;
  href: string;
};

export type DashboardData = {
  greeting: DashboardGreeting;
  tourInPartenza: DashboardTourInPartenza[];
  pagamenti: DashboardPagamenti;
  preventivi: DashboardPreventivi;
  documenti: DashboardDocumenti;
  camere: DashboardCamere;
  viaggiatori: DashboardViaggiatori;
  attivitaRecenti: DashboardAttivita[];
  kpi: DashboardKpi;
  calendario: DashboardCalendario;
  avvisi: DashboardAvviso[];
};

export type DashboardSearchIndex = {
  clienti: { id: string; nome: string; email: string }[];
  tours: { id: string; nomeTour: string; destinazione: string }[];
  partecipanti: {
    id: string;
    clienteNome: string;
    tourNome: string;
    tourId: string;
  }[];
};
