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
import { listPagamentiMock, seedPagamentiMock } from "@/mock/pagamenti";
import { listCamereMock, seedCamereMock } from "@/mock/camere";
import {
  listPartecipazioniMock,
  seedPartecipazioniMock,
} from "@/mock/tour-partecipazioni";
import { getToursSync } from "@/services/tour.service";
import { getClienti } from "@/services/clienti.service";
import type {
  GlobalSearchGroup,
  GlobalSearchIndex,
  GlobalSearchIndexEntry,
  GlobalSearchResponse,
} from "@/types/global-search";

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

  if (clienti.length > 0) {
    seedPartecipazioniMock(
      clienti.map((item) => ({
        id: item.id,
        nome: item.nome,
        email: item.email,
        telefono: "",
        azienda: "",
        stato: item.stato as "Attivo" | "Inattivo" | "Prospect",
        creatoIl: new Date().toISOString(),
      })),
    );
    seedPagamentiMock(listPartecipazioniMock());
    seedCamereMock(listPartecipazioniMock());
  }

  const tours = getToursSync().filter((tour) => tour.stato !== "Archiviato");
  for (const tour of tours) {
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

  for (const pagamento of listPagamentiMock()) {
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

  for (const camera of listCamereMock()) {
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

  try {
    const data = await getClienti();
    clienti = data.map((item) => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
      stato: item.stato,
    }));
  } catch {
    clienti = [];
  }

  return dedupeEntries([
    ...GLOBAL_SEARCH_STATIC_ENTRIES,
    ...buildDynamicEntries(clienti),
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
