import type { SchedulazioneRiepilogo } from "@/services/schedulazione.service";

type SchedulazioneRiepilogoCardsProps = {
  riepilogo: SchedulazioneRiepilogo;
  statoAttivo: string;
  onStatoChange: (stato: string) => void;
};

const CARDS = [
  { key: "programmata", label: "Programmate", color: "text-sky-700" },
  { key: "inviata", label: "Inviate", color: "text-emerald-700" },
  { key: "fallita", label: "Fallite", color: "text-rose-700" },
  { key: "bozza", label: "Bozze", color: "text-zinc-600" },
] as const;

export function SchedulazioneRiepilogoCards({
  riepilogo,
  statoAttivo,
  onStatoChange,
}: SchedulazioneRiepilogoCardsProps) {
  const values: Record<string, number> = {
    programmata: riepilogo.programmate,
    inviata: riepilogo.inviate,
    fallita: riepilogo.fallite,
    bozza: riepilogo.bozze,
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => {
        const isActive = statoAttivo === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onStatoChange(isActive ? "tutte" : card.key)}
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
