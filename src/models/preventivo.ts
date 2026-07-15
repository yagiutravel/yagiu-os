import type {
  PreventivoRigaInput,
  PreventivoSortDirection,
  PreventivoSortField,
  PreventivoTotals,
  PreventiviProcessOptions,
  PreventiviProcessResult,
  PreventivoListItem,
  StatoPreventivoFilter,
} from "@/types/preventivo";

export const PREVENTIVO_PAGE_SIZE = 20;
export const DEFAULT_TASSE_PERCENTUALE = 22;

export function centsToEuro(cents: number): number {
  return cents / 100;
}

export function euroToCents(euro: number): number {
  return Math.round(euro * 100);
}

export function calculatePreventivoTotals(
  righe: PreventivoRigaInput[],
  tassePercentuale = DEFAULT_TASSE_PERCENTUALE,
): PreventivoTotals {
  const subtotaleCents = righe.reduce((sum, riga) => {
    return sum + Math.round(riga.quantita * euroToCents(riga.prezzoUnitario));
  }, 0);
  const tasseCents = Math.round((subtotaleCents * tassePercentuale) / 100);
  const totaleCents = subtotaleCents + tasseCents;

  return {
    subtotaleCents,
    tasseCents,
    totaleCents,
    subtotale: centsToEuro(subtotaleCents),
    tasse: centsToEuro(tasseCents),
    totale: centsToEuro(totaleCents),
  };
}

function matchesStatoFilter(
  stato: PreventivoListItem["stato"],
  filter: StatoPreventivoFilter,
): boolean {
  if (filter === "tutti") return true;
  return stato.toLowerCase() === filter;
}

function comparePreventivi(
  a: PreventivoListItem,
  b: PreventivoListItem,
  field: PreventivoSortField,
  direction: PreventivoSortDirection,
): number {
  let result = 0;

  switch (field) {
    case "totale":
      result = a.totale - b.totale;
      break;
    case "numero":
      result = a.numero.localeCompare(b.numero, "it");
      break;
    case "cliente":
      result = a.clienteNome.localeCompare(b.clienteNome, "it");
      break;
    case "data":
    default:
      result = new Date(a.creatoIl).getTime() - new Date(b.creatoIl).getTime();
      break;
  }

  return direction === "asc" ? result : -result;
}

export function processPreventivi(
  items: PreventivoListItem[],
  options: PreventiviProcessOptions = {},
): PreventiviProcessResult {
  const search = options.search?.trim().toLowerCase() ?? "";
  const stato = options.stato ?? "tutti";
  const sortField = options.sortField ?? "data";
  const sortDirection = options.sortDirection ?? "desc";
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? PREVENTIVO_PAGE_SIZE;

  let filtered = items.filter((item) => {
    if (!matchesStatoFilter(item.stato, stato)) return false;
    if (!search) return true;

    return (
      item.numero.toLowerCase().includes(search) ||
      item.titolo.toLowerCase().includes(search) ||
      item.clienteNome.toLowerCase().includes(search) ||
      (item.tourNome?.toLowerCase().includes(search) ?? false)
    );
  });

  filtered = [...filtered].sort((a, b) =>
    comparePreventivi(a, b, sortField, sortDirection),
  );

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    totalItems,
    totalPages,
    page: safePage,
  };
}
