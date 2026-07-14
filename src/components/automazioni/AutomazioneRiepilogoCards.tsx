import type { AutomazioneRiepilogo } from "@/services/automazione.service";

type AutomazioneRiepilogoCardsProps = {
  riepilogo: AutomazioneRiepilogo;
  statoAttivo: string;
  onStatoChange: (stato: string) => void;
};

const CARDS = [
  { key: "attivo", label: "Attivi", color: "text-emerald-700" },
  { key: "inattivo", label: "Inattivi", color: "text-zinc-600" },
  { key: "bozza", label: "Bozze", color: "text-amber-700" },
] as const;

export function AutomazioneRiepilogoCards({
  riepilogo,
  statoAttivo,
  onStatoChange,
}: AutomazioneRiepilogoCardsProps) {
  const values: Record<string, number> = {
    attivo: riepilogo.attivi,
    inattivo: riepilogo.inattivi,
    bozza: riepilogo.bozze,
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CARDS.map((card) => {
        const isActive = statoAttivo === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onStatoChange(isActive ? "tutti" : card.key)}
            className={`rounded-xl px-4 py-3.5 text-left ring-1 ring-inset transition-colors ${
              isActive
                ? "bg-zinc-900 text-white ring-zinc-900"
                : "bg-zinc-50/60 ring-zinc-200/50 hover:bg-white"
            }`}
          >
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isActive ? "text-zinc-300" : "text-zinc-400"
              }`}
            >
              {card.label}
            </p>
            <p
              className={`mt-1.5 text-2xl font-semibold ${
                isActive ? "text-white" : card.color
              }`}
            >
              {values[card.key]}
            </p>
          </button>
        );
      })}
    </div>
  );
}
