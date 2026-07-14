import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { ComunicazioniStatoRiepilogo } from "@/types/comunicazione";

type ComunicazioniStatoWidgetProps = {
  stato: ComunicazioniStatoRiepilogo;
};

export function ComunicazioniStatoWidget({
  stato,
}: ComunicazioniStatoWidgetProps) {
  const items = [
    { label: "Inviate", value: stato.inviate, color: "text-emerald-700" },
    { label: "In coda", value: stato.inCoda, color: "text-amber-700" },
    { label: "Programmate", value: stato.programmate, color: "text-sky-700" },
    { label: "Fallite", value: stato.fallite, color: "text-rose-700" },
  ];

  return (
    <Card>
      <CardHeader
        title="Stato comunicazioni"
        description="Panoramica dello stato di tutte le comunicazioni."
        action={
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/15">
            <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
          </div>
        }
      />
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-zinc-50/60 px-4 py-3.5 ring-1 ring-inset ring-zinc-200/50"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {item.label}
              </p>
              <p className={`mt-1.5 text-2xl font-semibold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200/60 bg-white px-4 py-3">
          <p className="text-sm text-zinc-600">Totale comunicazioni</p>
          <p className="text-lg font-semibold text-zinc-900">{stato.totale}</p>
        </div>
      </CardContent>
    </Card>
  );
}
