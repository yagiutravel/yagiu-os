import type { ClienteStato } from "@/types/cliente";
import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";

type BadgeProps = {
  stato: ClienteStato;
};

const statoStyles: Record<ClienteStato, string> = {
  Attivo: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Inattivo: "bg-zinc-100 text-zinc-600 ring-zinc-500/10",
  Prospect: "bg-amber-50 text-amber-700 ring-amber-600/15",
};

export function StatoBadge({ stato }: BadgeProps) {
  return (
    <span className={`${profiloBadgeBase} ${statoStyles[stato]}`}>
      {stato}
    </span>
  );
}
