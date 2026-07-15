import type { TourStato } from "@/types/tour";
import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";

type TourStatoBadgeProps = {
  stato: TourStato;
};

const statoStyles: Record<TourStato, string> = {
  Bozza: "bg-zinc-50 text-zinc-600 ring-zinc-500/10",
  "In vendita": "bg-sky-50 text-sky-700 ring-sky-600/15",
  Completo: "bg-amber-50 text-amber-700 ring-amber-600/15",
  "In corso": "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Terminato: "bg-zinc-100 text-zinc-600 ring-zinc-500/10",
  Archiviato: "bg-violet-50 text-violet-700 ring-violet-600/15",
};

export function TourStatoBadge({ stato }: TourStatoBadgeProps) {
  return (
    <span className={`${profiloBadgeBase} ${statoStyles[stato]}`}>
      {stato}
    </span>
  );
}
