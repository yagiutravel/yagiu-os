import {
  GLOBAL_SEARCH_CATEGORIA_LABELS,
  GLOBAL_SEARCH_CATEGORIA_ORDER,
} from "@/lib/global-search/constants";
import { createSearchEntry, matchesSearchQuery } from "@/models/global-search";
import { GLOBAL_SEARCH_STATIC_ENTRIES } from "@/mock/global-search-index";
import { listEventiMock, seedClienteTimelineMock } from "@/mock/cliente-timeline";
import {
  listDocumentiMock,
  seedClienteDocumentiMock,
} from "@/mock/cliente-documenti";
import {
  listQuestionariMock,
  seedClienteQuestionarioMock,
} from "@/mock/cliente-questionari";
import { listAllPagamenti } from "@/services/pagamento.service";
import { listAllTourDocumenti } from "@/services/tour-documento.service";
import { listAllRooms } from "@/services/camera.service";
import { getTours } from "@/services/tour.service";
import { getClienti } from "@/services/clienti.service";
import type {
  GlobalSearchGroup,
  GlobalSearchIndex,
  GlobalSearchIndexEntry,
  GlobalSearchResponse,
} from "@/types/global-search";
import type { Tour } from "@/types/tour";
import type { Camera } from "@/types/camera";

function dedupeEntries(entries: GlobalSearchIndexEntry[]): GlobalSearchIndexEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

function buildDynamicEntries(
  clienti: Array<{ id: string; nome: string; email: string; stato: string }>,
  tours: Tour[],
  camere: Camera[],
  pagamenti: Array<{ id: string; tourId: string; tipo: string; importo: number; metodo: string; data: string }>,
  documentiTour: Array<{ id: string; tourId: string; nome: string; categoria: string }>,
): GlobalSearchIndexEntry[] {
  const entries: GlobalSearchIndexEntry[] = [];

  for (const cliente of clienti) {
    seedClienteDocumentiMock(cliente.id);
    seedClienteQuestionarioMock(cliente.id);
    seedClienteTimelineMock(cliente.id, cliente.nome);

    entries.push(
      createSearchEntry(
        "clienti",
        cliente.id,
        cliente.nome,
        `${cliente.email} · ${cliente.stato}`,
        `/clienti/${cliente.id}`,
        [cliente.email, cliente.stato],
      ),
      createSearchEntry(
        "questionari",
        cliente.id,
        `Questionario ${cliente.nome}`,
        "Dati alimentari e logistici del viaggiatore",
        `/clienti/${cliente.id}`,
        ["questionario", "allergie", "preferenze"],
      ),
      createSearchEntry(
        "timeline",
        cliente.id,
        `Timeline ${cliente.nome}`,
        "Cronologia eventi del viaggiatore",
        `/clienti/${cliente.id}`,
        ["timeline", "eventi", "cronologia"],
      ),
    );
  }

  const activeTours = tours.filter((tour) => tour.stato !== "Archiviato");
  for (const tour of activeTours) {
    entries.push(
      createSearchEntry(
        "tour",
        tour.id,
        tour.nomeTour,
        `${tour.destinazione} · ${tour.stato}`,
        `/tour/${tour.id}`,
        [tour.destinazione, tour.stato, tour.tourLeader],
      ),
      createSearchEntry(
        "pagamenti",
        `tour-${tour.id}`,
        `Pagamenti ${tour.nomeTour}`,
        "Storico acconti e saldi del tour",
        `/tour/${tour.id}`,
        ["pagamenti", "acconto", "saldo"],
      ),
      createSearchEntry(
        "camere",
        `tour-${tour.id}`,
        `Camere ${tour.nomeTour}`,
        "Rooming list e assegnazioni",
        `/tour/${tour.id}`,
        ["camere", "rooming"],
      ),
    );
  }

  for (const pagamento of pagamenti) {
    entries.push(
      createSearchEntry(
        "pagamenti",
        pagamento.id,
        `${pagamento.tipo} — € ${pagamento.importo}`,
        `${pagamento.metodo} · ${pagamento.data}`,
        `/tour/${pagamento.tourId}`,
        [pagamento.tipo, pagamento.metodo, String(pagamento.importo)],
      ),
    );
  }

  for (const documento of documentiTour) {
    entries.push(
      createSearchEntry(
        "documenti",
        documento.id,
        `${documento.categoria} — ${documento.nome}`,
        `Documento tour`,
        `/tour/${documento.tourId}`,
        [documento.categoria, documento.nome],
      ),
    );
  }

  for (const camera of camere) {
    entries.push(
      createSearchEntry(
        "camere",
        camera.id,
        `Camera ${camera.numero} — ${camera.tipologia}`,
        `Tour ${camera.tourId}`,
        `/tour/${camera.tourId}`,
        [camera.numero, camera.tipologia, camera.note],
      ),
    );
  }

  for (const documento of listDocumentiMock()) {
    entries.push(
      createSearchEntry(
        "documenti",
        documento.id,
        `${documento.tipo.replace("_", " ")} — ${documento.numero}`,
        `Scadenza ${documento.scadenza}`,
        `/clienti/${documento.clienteId}`,
        [documento.tipo, documento.numero, documento.scadenza],
      ),
    );
  }

  for (const questionario of listQuestionariMock()) {
    entries.push(
      createSearchEntry(
        "questionari",
        questionario.id,
        `Questionario cliente ${questionario.clienteId.slice(0, 8)}`,
        `${questionario.allergie} · ${questionario.cameraPreferita}`,
        `/clienti/${questionario.clienteId}`,
        [
          questionario.allergie,
          questionario.intolleranze,
          questionario.cameraPreferita,
        ],
      ),
    );
  }

  for (const evento of listEventiMock()) {
    entries.push(
      createSearchEntry(
        "timeline",
        evento.id,
        evento.titolo,
        evento.descrizione,
        `/clienti/${evento.clienteId}`,
        [evento.tipo, evento.utente],
      ),
    );
  }

  return entries;
}

export async function buildGlobalSearchIndex(): Promise<GlobalSearchIndex> {
  let clienti: Array<{ id: string; nome: string; email: string; stato: string }> =
    [];
  let tours: Tour[] = [];
  let camere: Camera[] = [];
  let pagamenti: Array<{
    id: string;
    tourId: string;
    tipo: string;
    importo: number;
    metodo: string;
    data: string;
  }> = [];
  let documentiTour: Array<{
    id: string;
    tourId: string;
    nome: string;
    categoria: string;
  }> = [];

  try {
    const [clientiData, toursData, camereData, pagamentiData, documentiData] =
      await Promise.all([
      getClienti(),
      getTours(),
      listAllRooms(),
      listAllPagamenti(),
      listAllTourDocumenti(),
    ]);
    clienti = clientiData.map((item) => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
      stato: item.stato,
    }));
    tours = toursData;
    camere = camereData;
    pagamenti = pagamentiData.map((item) => ({
      id: item.id,
      tourId: item.tourId,
      tipo: item.tipo,
      importo: item.importo,
      metodo: item.metodo,
      data: item.data,
    }));
    documentiTour = documentiData.map((item) => ({
      id: item.id,
      tourId: item.tourId,
      nome: item.nome,
      categoria: item.categoria,
    }));
  } catch {
    clienti = [];
    tours = [];
    camere = [];
    pagamenti = [];
    documentiTour = [];
  }

  return dedupeEntries([
    ...GLOBAL_SEARCH_STATIC_ENTRIES,
    ...buildDynamicEntries(clienti, tours, camere, pagamenti, documentiTour),
  ]);
}

export function searchGlobalIndex(
  index: GlobalSearchIndex,
  query: string,
): GlobalSearchResponse {
  const normalized = query.trim();
  if (!normalized) {
    return { query: normalized, gruppi: [], totale: 0 };
  }

  const matched = index.filter((entry) => matchesSearchQuery(entry, normalized));

  const gruppi: GlobalSearchGroup[] = GLOBAL_SEARCH_CATEGORIA_ORDER.map(
    (categoria) => ({
      categoria,
      label: GLOBAL_SEARCH_CATEGORIA_LABELS[categoria],
      risultati: matched.filter((entry) => entry.categoria === categoria),
    }),
  ).filter((group) => group.risultati.length > 0);

  return {
    query: normalized,
    gruppi,
    totale: matched.length,
  };
}
