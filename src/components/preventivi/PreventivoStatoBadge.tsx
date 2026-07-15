import type { StatoPreventivo } from "@/types/preventivo";
import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";

type PreventivoStatoBadgeProps = {
  stato: StatoPreventivo;
};

const statoStyles: Record<StatoPreventivo, string> = {
  Bozza: "bg-zinc-50 text-zinc-600 ring-zinc-500/10",
  Inviato: "bg-sky-50 text-sky-700 ring-sky-600/15",
  Accettato: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Rifiutato: "bg-rose-50 text-rose-700 ring-rose-600/15",
  Scaduto: "bg-amber-50 text-amber-700 ring-amber-600/15",
  Convertito: "bg-violet-50 text-violet-700 ring-violet-600/15",
};

export function PreventivoStatoBadge({ stato }: PreventivoStatoBadgeProps) {
  return (
    <span className={`${profiloBadgeBase} ${statoStyles[stato]}`}>
      {stato}
    </span>
  );
}
