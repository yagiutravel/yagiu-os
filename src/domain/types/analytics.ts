export type TourOccupancyStats = {
  tourId: string;
  nomeTour: string;
  partecipanti: number;
  capienzaMassima: number;
  percentualeRiempimento: number;
  postiDisponibili: number;
  quasiCompleto: boolean;
};

export type TourStatistics = {
  tourId: string;
  nomeTour: string;
  stato: string;
  partecipanti: number;
  capienzaMassima: number;
  camere: number;
  camereComplete: number;
  camereIncomplete: number;
  postiCameraOccupati: number;
  postiCameraTotali: number;
};

export type RoomAvailability = {
  tourId: string;
  cameraId: string;
  numero: string;
  tipologia: string;
  capienza: number;
  occupazione: number;
  postiLiberi: number;
  completa: boolean;
};

export type PaymentOutstanding = {
  partecipazioneId: string;
  clienteId: string;
  tourId: string;
  tipo: "acconto" | "saldo";
  pagamento: string;
};

export type DocumentMissing = {
  partecipazioneId: string;
  clienteId: string;
  tourId: string;
  tipo: "passaporto" | "questionario" | "documenti";
  stato: string;
};

export type DashboardDomainSummary = {
  tourInPartenza: number;
  accontiMancanti: number;
  saldiMancanti: number;
  documentiMancanti: number;
  camereIncomplete: number;
  clientiInattivi: number;
  attivitaRichiedonoAttenzione: number;
};

export type AnalyticsSummary = {
  numeroClienti: number;
  numeroTour: number;
  numeroTourAttivi: number;
  numeroTourConclusi: number;
  numeroTourFuturi: number;
  riempimentoMedio: number;
  numeroPartecipanti: number;
  clientiAttivi: number;
  clientiInattivi: number;
  clientiProspect: number;
  tassoOccupazioneCamere: number;
  numeroCamere: number;
  postiCameraOccupati: number;
  postiCameraDisponibili: number;
  numeroMedioViaggiPerCliente: number;
  clientiConAlmenoDueViaggi: number;
  etaMediaViaggiatori: number | null;
};

export type UpcomingDeparture = {
  tourId: string;
  nomeTour: string;
  destinazione: string;
  dataPartenza: string;
  giorniMancanti: number;
  stato: string;
};

export type ClientReadyToTravel = {
  clienteId: string;
  nome: string;
  tourId: string;
  nomeTour: string;
  pagamentoOk: boolean;
  documentiOk: boolean;
  questionarioOk: boolean;
  pronto: boolean;
};
