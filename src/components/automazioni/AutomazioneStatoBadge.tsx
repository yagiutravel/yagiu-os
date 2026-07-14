import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { AUTOMAZIONE_STATO_LABELS } from "@/lib/automazione/constants";
import type { AutomazioneStato } from "@/types/automazione";

const STYLES: Record<
  AutomazioneStato,
  { bg: string; text: string; ring: string }
> = {
  attivo: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/15",
  },
  inattivo: {
    bg: "bg-zinc-100",
    text: "text-zinc-600",
    ring: "ring-zinc-500/10",
  },
  bozza: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/15",
  },
};

type AutomazioneStatoBadgeProps = {
  stato: AutomazioneStato;
};

export function AutomazioneStatoBadge({ stato }: AutomazioneStatoBadgeProps) {
  const style = STYLES[stato];
  return (
    <span
      className={`${profiloBadgeBase} ${style.bg} ${style.text} ${style.ring}`}
    >
      {AUTOMAZIONE_STATO_LABELS[stato]}
    </span>
  );
}
