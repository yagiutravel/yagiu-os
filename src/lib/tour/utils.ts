import { TOUR_PAGE_SIZE } from "@/lib/tour/constants";
import type { Tour, TourFilters } from "@/types/tour";

export function filterTours(tours: Tour[], filters: TourFilters): Tour[] {
  const query = filters.search.toLowerCase().trim();

  return tours.filter((tour) => {
    const matchesStato =
      filters.stato === "tutti"
        ? tour.stato !== "Archiviato"
        : tour.stato === filters.stato;

    const matchesSearch =
      !query ||
      tour.nomeTour.toLowerCase().includes(query) ||
      tour.destinazione.toLowerCase().includes(query) ||
      tour.tourLeader.toLowerCase().includes(query);

    return matchesStato && matchesSearch;
  });
}

export function sortTours(tours: Tour[]): Tour[] {
  return [...tours].sort(
    (a, b) =>
      new Date(b.dataPartenza).getTime() - new Date(a.dataPartenza).getTime(),
  );
}

export function paginateTours<T>(items: T[], page: number, pageSize = TOUR_PAGE_SIZE) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    totalItems,
    totalPages,
    currentPage: safePage,
    pageSize,
  };
}

export function processTours(tours: Tour[], filters: TourFilters) {
  const filtered = filterTours(tours, filters);
  const sorted = sortTours(filtered);
  return paginateTours(sorted, filters.page);
}

export function formatTourDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPartecipanti(attuali: number, massimo: number): string {
  return `${attuali}/${massimo}`;
}
