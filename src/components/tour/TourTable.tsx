import { Pagination } from "@/components/ui/Pagination";
import {
  formatPartecipanti,
  formatTourDate,
} from "@/lib/tour/utils";
import type { Tour } from "@/types/tour";
import { TourStatoBadge } from "./TourStatoBadge";
import { TourRowActions } from "./TourRowActions";

type TourTableProps = {
  tours: Tour[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick: (tour: Tour) => void;
  onEdit?: (tour: Tour) => void;
  onArchive?: (tour: Tour) => void;
  onDelete?: (tour: Tour) => void;
};

export function TourTable({
  tours,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onRowClick,
  onEdit,
  onArchive,
  onDelete,
}: TourTableProps) {
  const showActions = Boolean(onEdit || onArchive || onDelete);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Nome Tour
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Destinazione
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Data partenza
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Data ritorno
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Stato
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Partecipanti
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Tour Leader
              </th>
              {showActions && (
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Azioni
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {tours.map((tour) => (
              <tr
                key={tour.id}
                className="cursor-pointer transition-colors duration-200 hover:bg-zinc-50/80"
                onClick={() => onRowClick(tour)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(tour);
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label={`Apri scheda di ${tour.nomeTour}`}
              >
                <td className="px-4 py-3.5 font-medium text-zinc-900">
                  {tour.nomeTour}
                </td>
                <td className="px-4 py-3.5 text-zinc-600">{tour.destinazione}</td>
                <td className="px-4 py-3.5 text-zinc-600">
                  {formatTourDate(tour.dataPartenza)}
                </td>
                <td className="px-4 py-3.5 text-zinc-600">
                  {formatTourDate(tour.dataRitorno)}
                </td>
                <td className="px-4 py-3.5">
                  <TourStatoBadge stato={tour.stato} />
                </td>
                <td className="px-4 py-3.5 text-zinc-600">
                  {formatPartecipanti(
                    tour.numeroPartecipanti,
                    tour.capienzaMassima,
                  )}
                </td>
                <td className="px-4 py-3.5 text-zinc-600">{tour.tourLeader}</td>
                {showActions && (
                  <td className="px-4 py-3.5 text-right">
                    <TourRowActions
                      tour={tour}
                      onEdit={onEdit}
                      onArchive={onArchive}
                      onDelete={onDelete}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
