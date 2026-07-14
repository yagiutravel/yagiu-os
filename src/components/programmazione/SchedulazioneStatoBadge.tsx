import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { SCHEDULAZIONE_STATO_LABELS } from "@/lib/schedulazione/constants";
import type { SchedulazioneStato } from "@/types/schedulazione";

const STYLES: Record<
  SchedulazioneStato,
  { bg: string; text: string; ring: string }
> = {
  programmata: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/15",
  },
  inviata: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/15",
  },
  fallita: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-600/15",
  },
  bozza: {
    bg: "bg-zinc-100",
    text: "text-zinc-600",
    ring: "ring-zinc-500/10",
  },
};

type SchedulazioneStatoBadgeProps = {
  stato: SchedulazioneStato;
};

export function SchedulazioneStatoBadge({ stato }: SchedulazioneStatoBadgeProps) {
  const style = STYLES[stato];
  return (
    <span
      className={`${profiloBadgeBase} ${style.bg} ${style.text} ${style.ring}`}
    >
      {SCHEDULAZIONE_STATO_LABELS[stato]}
    </span>
  );
}
