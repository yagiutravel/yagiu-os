import {
  AVVISO_LIVELLO_EMOJI,
  calcolaGiorniMancanti,
  DASHBOARD_USER_NAME,
  getSalutoPeriodo,
  getSalutoTesto,
  IMPORTO_ACCONTO_MEDIO,
  IMPORTO_SALDO_MEDIO,
} from "@/models/dashboard";
import {
  MOCK_COMPLEANNI_MESE,
  MOCK_LIBERATORIE_MANCANTI,
} from "@/mock/dashboard";
import type { CameraView } from "@/types/camera";
import type { Cliente } from "@/types/cliente";
import type {
  DashboardAttivita,
  DashboardAvviso,
  DashboardCalendario,
  DashboardCalendarioEvento,
  DashboardCamere,
  DashboardData,
  DashboardDocumenti,
  DashboardGreeting,
  DashboardKpi,
  DashboardPagamenti,
  DashboardPreventivi,
  DashboardSearchIndex,
  DashboardSearchResult,
  DashboardTourInPartenza,
  DashboardViaggiatori,
} from "@/types/dashboard";
import type { PartecipazioneTourView } from "@/types/tour-partecipazione";
import type { Tour } from "@/types/tour";

type DashboardAggregationInput = {
  clienti: Cliente[];
  tours: Tour[];
  partecipazioniByTour: Map<string, PartecipazioneTourView[]>;
  camereByTour: Map<string, CameraView[]>;
  assicurazioniMancanti?: number;
  preventiviInAttesa?: number;
  preventiviAccettati?: number;
  preventiviValoreInAttesa?: number;
  now?: Date;
};

function isTourAttivo(tour: Tour): boolean {
  return tour.stato !== "Terminato";
}

function isNuovoCliente(cliente: Cliente, now: Date): boolean {
  const created = new Date(`${cliente.creatoIl}T00:00:00`);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return created >= weekAgo;
}

function getAllPartecipazioni(
  partecipazioniByTour: Map<string, PartecipazioneTourView[]>,
): PartecipazioneTourView[] {
  return Array.from(partecipazioniByTour.values()).flat();
}

export function mapTourInPartenza(
  tours: Tour[],
  now = new Date(),
): DashboardTourInPartenza[] {
  const oggi = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return tours
    .filter((tour) => {
      const partenza = new Date(`${tour.dataPartenza}T00:00:00`);
      return isTourAttivo(tour) && partenza >= oggi;
    })
    .map((tour) => ({
      tourId: tour.id,
      nomeTour: tour.nomeTour,
      destinazione: tour.destinazione,
      dataPartenza: tour.dataPartenza,
      giorniMancanti: calcolaGiorniMancanti(tour.dataPartenza, now),
      stato: tour.stato,
    }))
    .sort((a, b) => a.giorniMancanti - b.giorniMancanti)
    .slice(0, 5);
}

export function mapPagamenti(
  partecipazioni: PartecipazioneTourView[],
): DashboardPagamenti {
  const accontiMancanti = partecipazioni.filter(
    (item) => item.pagamento === "Non iniziato",
  ).length;
  const saldiMancanti = partecipazioni.filter(
    (item) => item.pagamento === "Acconto ricevuto",
  ).length;

  return {
    accontiMancanti,
    saldiMancanti,
    importoTotaleDaIncassare:
      accontiMancanti * IMPORTO_ACCONTO_MEDIO +
      saldiMancanti * IMPORTO_SALDO_MEDIO,
  };
}

export function mapDocumenti(
  partecipazioni: PartecipazioneTourView[],
  assicurazioniMancanti = 0,
): DashboardDocumenti {
  const questionariMancanti = partecipazioni.filter(
    (item) => item.questionario === "Da compilare",
  ).length;
  const passaportiMancanti = partecipazioni.filter(
    (item) => item.documenti === "Da inviare",
  ).length;

  return {
    passaportiMancanti,
    questionariMancanti,
    assicurazioniMancanti,
    liberatorieMancanti: MOCK_LIBERATORIE_MANCANTI,
  };
}

export function mapCamere(
  camereByTour: Map<string, CameraView[]>,
): DashboardCamere {
  let camereComplete = 0;
  let camereIncomplete = 0;
  let postiDisponibili = 0;
  let overbooking = 0;
  let tourIdPrioritario: string | null = null;
  let maxIncomplete = 0;

  for (const [tourId, camere] of camereByTour) {
    let tourIncomplete = 0;

    for (const camera of camere) {
      if (camera.statoOccupazione === "Completa") {
        camereComplete += 1;
      } else {
        camereIncomplete += 1;
        tourIncomplete += 1;
      }

      postiDisponibili += Math.max(camera.capienza - camera.occupazione, 0);

      if (camera.occupazione > camera.capienza) {
        overbooking += camera.occupazione - camera.capienza;
      }
    }

    if (tourIncomplete > maxIncomplete) {
      maxIncomplete = tourIncomplete;
      tourIdPrioritario = tourId;
    }
  }

  return {
    camereComplete,
    camereIncomplete,
    postiDisponibili,
    overbooking,
    tourIdPrioritario,
  };
}

export function mapViaggiatori(
  clienti: Cliente[],
  partecipazioniByTour: Map<string, PartecipazioneTourView[]>,
  tours: Tour[],
  now = new Date(),
): DashboardViaggiatori {
  const tourById = new Map(tours.map((tour) => [tour.id, tour]));
  const allPartecipazioni = getAllPartecipazioni(partecipazioniByTour);

  const ultimiIscritti = [...allPartecipazioni]
    .sort(
      (a, b) =>
        new Date(b.creatoIl).getTime() - new Date(a.creatoIl).getTime(),
    )
    .slice(0, 4)
    .map((item) => ({
      partecipazioneId: item.id,
      clienteId: item.clienteId,
      nome: item.clienteNome,
      tourNome: tourById.get(item.tourId)?.nomeTour ?? "Tour",
      tourId: item.tourId,
    }));

  return {
    nuoviClienti: clienti.filter((item) => isNuovoCliente(item, now)).length,
    ultimiIscritti,
    compleanniDelMese: MOCK_COMPLEANNI_MESE,
    clientiInattivi: clienti.filter((item) => item.stato === "Inattivo").length,
  };
}

export function mapKpi(
  clienti: Cliente[],
  tours: Tour[],
  camereByTour: Map<string, CameraView[]>,
): DashboardKpi {
  const camere = Array.from(camereByTour.values()).flat();
  const postiOccupati = camere.reduce((sum, item) => sum + item.occupazione, 0);
  const postiTotali = camere.reduce((sum, item) => sum + item.capienza, 0);
  const postiDisponibili = Math.max(postiTotali - postiOccupati, 0);
  const partecipanti = tours.reduce(
    (sum, tour) => sum + tour.numeroPartecipanti,
    0,
  );

  return {
    clienti: clienti.length,
    tour: tours.filter(isTourAttivo).length,
    partecipanti,
    camere: camere.length,
    postiOccupati,
    postiDisponibili,
    percentualeOccupazioneMedia:
      postiTotali > 0 ? Math.round((postiOccupati / postiTotali) * 100) : 0,
  };
}

export function mapAttivitaRecenti(
  input: DashboardAggregationInput,
): DashboardAttivita[] {
  const { clienti, tours, partecipazioniByTour, camereByTour } = input;
  const tourById = new Map(tours.map((tour) => [tour.id, tour]));
  const attivita: DashboardAttivita[] = [];

  for (const [tourId, partecipazioni] of partecipazioniByTour) {
    const tour = tourById.get(tourId);
    if (!tour) continue;

    for (const partecipazione of partecipazioni.slice(0, 2)) {
      attivita.push({
        id: `att-part-${partecipazione.id}`,
        tipo: "partecipante",
        ora: partecipazione.creatoIl,
        descrizione: `${partecipazione.clienteNome} aggiunto al Tour ${tour.nomeTour}`,
        href: `/tour/${tourId}`,
      });
    }
  }

  const recentClienti = [...clienti]
    .sort(
      (a, b) =>
        new Date(b.creatoIl).getTime() - new Date(a.creatoIl).getTime(),
    )
    .slice(0, 2);

  for (const cliente of recentClienti) {
    attivita.push({
      id: `att-cli-${cliente.id}`,
      tipo: "cliente",
      ora: `${cliente.creatoIl}T10:00:00`,
      descrizione: `Nuovo Cliente inserito: ${cliente.nome}`,
      href: `/clienti/${cliente.id}`,
    });
  }

  for (const [tourId, camere] of camereByTour) {
    const camera = camere[0];
    if (!camera) continue;

    attivita.push({
      id: `att-cam-${camera.id}`,
      tipo: "camera",
      ora: camera.aggiornatoIl,
      descrizione: `Camera ${camera.numero} modificata`,
      href: `/tour/${tourId}`,
    });
  }

  const pagamentoRicevuto = getAllPartecipazioni(partecipazioniByTour).find(
    (item) => item.pagamento === "Saldo ricevuto",
  );

  if (pagamentoRicevuto) {
    attivita.push({
      id: `att-pay-${pagamentoRicevuto.id}`,
      tipo: "pagamento",
      ora: pagamentoRicevuto.aggiornatoIl,
      descrizione: `Saldo ricevuto da ${pagamentoRicevuto.clienteNome}`,
      href: "/pagamenti",
    });
  }

  const documentoRicevuto = getAllPartecipazioni(partecipazioniByTour).find(
    (item) => item.documenti === "Ricevuti" || item.documenti === "Verificati",
  );

  if (documentoRicevuto) {
    attivita.push({
      id: `att-doc-${documentoRicevuto.id}`,
      tipo: "documento",
      ora: documentoRicevuto.aggiornatoIl,
      descrizione: `${documentoRicevuto.clienteNome} ha inviato il passaporto`,
      href: `/clienti/${documentoRicevuto.clienteId}`,
    });
  }

  const tourRecente = [...tours]
    .filter(isTourAttivo)
    .sort((a, b) => a.dataPartenza.localeCompare(b.dataPartenza))[0];

  if (tourRecente) {
    attivita.push({
      id: `att-tour-${tourRecente.id}`,
      tipo: "tour",
      ora: `${tourRecente.dataPartenza}T08:00:00`,
      descrizione: `Nuovo Tour creato: ${tourRecente.nomeTour}`,
      href: `/tour/${tourRecente.id}`,
    });
  }

  return attivita
    .sort((a, b) => new Date(b.ora).getTime() - new Date(a.ora).getTime())
    .slice(0, 8);
}

export function mapCalendario(
  tours: Tour[],
  now = new Date(),
): DashboardCalendario {
  const eventi: DashboardCalendarioEvento[] = [];

  for (const tour of tours.filter(isTourAttivo)) {
    eventi.push({
      id: `cal-p-${tour.id}`,
      data: tour.dataPartenza,
      tipo: "partenza",
      titolo: `Partenza — ${tour.nomeTour}`,
    });
    eventi.push({
      id: `cal-r-${tour.id}`,
      data: tour.dataRitorno,
      tipo: "rientro",
      titolo: `Rientro — ${tour.nomeTour}`,
    });
  }

  eventi.push(
    {
      id: "cal-scad-1",
      data: new Date(now.getFullYear(), now.getMonth(), 18)
        .toISOString()
        .split("T")[0],
      tipo: "scadenza",
      titolo: "Scadenza saldi Tour Giappone",
    },
    {
      id: "cal-att-1",
      data: new Date(now.getFullYear(), now.getMonth(), 20)
        .toISOString()
        .split("T")[0],
      tipo: "attivita",
      titolo: "Briefing pre-partenza staff",
    },
  );

  return {
    mese: now.getMonth(),
    anno: now.getFullYear(),
    eventi: eventi.sort((a, b) => a.data.localeCompare(b.data)),
  };
}

export function mapAvvisi(
  pagamenti: DashboardPagamenti,
  documenti: DashboardDocumenti,
  camere: DashboardCamere,
  tourInPartenza: DashboardTourInPartenza[],
  viaggiatori: DashboardViaggiatori,
): DashboardAvviso[] {
  const avvisi: DashboardAvviso[] = [];

  if (pagamenti.saldiMancanti > 0) {
    avvisi.push({
      id: "avv-saldi",
      livello: "critico",
      emoji: AVVISO_LIVELLO_EMOJI.critico,
      messaggio: `${pagamenti.saldiMancanti} saldi da ricevere`,
      href: "/pagamenti",
    });
  }

  if (documenti.passaportiMancanti > 0) {
    avvisi.push({
      id: "avv-pass",
      livello: "attenzione",
      emoji: AVVISO_LIVELLO_EMOJI.attenzione,
      messaggio: `${documenti.passaportiMancanti} passaporti mancanti`,
      href: "/clienti",
    });
  }

  if (camere.camereIncomplete > 0) {
    avvisi.push({
      id: "avv-cam",
      livello: "avviso",
      emoji: AVVISO_LIVELLO_EMOJI.avviso,
      messaggio: `${camere.camereIncomplete} camere incomplete`,
      href: camere.tourIdPrioritario
        ? `/tour/${camere.tourIdPrioritario}`
        : "/tour",
    });
  }

  const tourDomani = tourInPartenza.find((item) => item.giorniMancanti <= 1);
  if (tourDomani) {
    avvisi.push({
      id: "avv-tour",
      livello: "info",
      emoji: AVVISO_LIVELLO_EMOJI.info,
      messaggio: `1 tour parte ${tourDomani.giorniMancanti === 0 ? "oggi" : "domani"}`,
      href: `/tour/${tourDomani.tourId}`,
    });
  }

  if (viaggiatori.nuoviClienti > 0) {
    avvisi.push({
      id: "avv-cli",
      livello: "success",
      emoji: AVVISO_LIVELLO_EMOJI.success,
      messaggio: `${viaggiatori.nuoviClienti} nuovi clienti questa settimana`,
      href: "/clienti",
    });
  }

  return avvisi;
}

export function calcolaAttivitaRichiedonoAttenzione(
  pagamenti: DashboardPagamenti,
  documenti: DashboardDocumenti,
  camere: DashboardCamere,
  tourInPartenza: DashboardTourInPartenza[],
  preventiviInAttesa = 0,
): number {
  let count = 0;
  count += pagamenti.accontiMancanti + pagamenti.saldiMancanti;
  count += documenti.passaportiMancanti + documenti.questionariMancanti;
  count += camere.camereIncomplete;
  count += tourInPartenza.filter((item) => item.giorniMancanti <= 7).length;
  count += preventiviInAttesa;
  return count;
}

export function mapGreeting(
  attivitaRichiedonoAttenzione: number,
  now = new Date(),
): DashboardGreeting {
  const periodo = getSalutoPeriodo(now);
  return {
    saluto: getSalutoTesto(periodo),
    nome: DASHBOARD_USER_NAME,
    attivitaRichiedonoAttenzione,
  };
}

export function mapPreventivi(input: DashboardAggregationInput): DashboardPreventivi {
  return {
    inAttesa: input.preventiviInAttesa ?? 0,
    accettati: input.preventiviAccettati ?? 0,
    valoreTotaleInAttesa: input.preventiviValoreInAttesa ?? 0,
  };
}

export function mapDashboardData(input: DashboardAggregationInput): DashboardData {
  const { clienti, tours, partecipazioniByTour, camereByTour, now = new Date() } =
    input;
  const allPartecipazioni = getAllPartecipazioni(partecipazioniByTour);

  const tourInPartenza = mapTourInPartenza(tours, now);
  const pagamenti = mapPagamenti(allPartecipazioni);
  const preventivi = mapPreventivi(input);
  const documenti = mapDocumenti(
    allPartecipazioni,
    input.assicurazioniMancanti ?? 0,
  );
  const camere = mapCamere(camereByTour);
  const viaggiatori = mapViaggiatori(
    clienti,
    partecipazioniByTour,
    tours,
    now,
  );
  const kpi = mapKpi(clienti, tours, camereByTour);
  const attivitaRecenti = mapAttivitaRecenti(input);
  const calendario = mapCalendario(tours, now);
  const avvisi = mapAvvisi(
    pagamenti,
    documenti,
    camere,
    tourInPartenza,
    viaggiatori,
  );
  const attivitaRichiedonoAttenzione = calcolaAttivitaRichiedonoAttenzione(
    pagamenti,
    documenti,
    camere,
    tourInPartenza,
    preventivi.inAttesa,
  );

  return {
    greeting: mapGreeting(attivitaRichiedonoAttenzione, now),
    tourInPartenza,
    pagamenti,
    preventivi,
    documenti,
    camere,
    viaggiatori,
    attivitaRecenti,
    kpi,
    calendario,
    avvisi,
  };
}

export function buildSearchIndex(
  clienti: Cliente[],
  tours: Tour[],
  partecipazioniByTour: Map<string, PartecipazioneTourView[]>,
): DashboardSearchIndex {
  const tourById = new Map(tours.map((tour) => [tour.id, tour]));

  return {
    clienti: clienti.map((item) => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
    })),
    tours: tours.map((item) => ({
      id: item.id,
      nomeTour: item.nomeTour,
      destinazione: item.destinazione,
    })),
    partecipanti: getAllPartecipazioni(partecipazioniByTour).map((item) => ({
      id: item.id,
      clienteNome: item.clienteNome,
      tourNome: tourById.get(item.tourId)?.nomeTour ?? "Tour",
      tourId: item.tourId,
    })),
  };
}

export function searchDashboardIndex(
  index: DashboardSearchIndex,
  query: string,
): DashboardSearchResult[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const results: DashboardSearchResult[] = [];

  for (const cliente of index.clienti) {
    if (
      cliente.nome.toLowerCase().includes(normalized) ||
      cliente.email.toLowerCase().includes(normalized)
    ) {
      results.push({
        tipo: "cliente",
        id: cliente.id,
        titolo: cliente.nome,
        sottotitolo: cliente.email,
        href: `/clienti/${cliente.id}`,
      });
    }
  }

  for (const tour of index.tours) {
    if (
      tour.nomeTour.toLowerCase().includes(normalized) ||
      tour.destinazione.toLowerCase().includes(normalized)
    ) {
      results.push({
        tipo: "tour",
        id: tour.id,
        titolo: tour.nomeTour,
        sottotitolo: tour.destinazione,
        href: `/tour/${tour.id}`,
      });
    }
  }

  for (const partecipante of index.partecipanti) {
    if (
      partecipante.clienteNome.toLowerCase().includes(normalized) ||
      partecipante.tourNome.toLowerCase().includes(normalized)
    ) {
      results.push({
        tipo: "partecipante",
        id: partecipante.id,
        titolo: partecipante.clienteNome,
        sottotitolo: partecipante.tourNome,
        href: `/tour/${partecipante.tourId}`,
      });
    }
  }

  return results.slice(0, 8);
}
