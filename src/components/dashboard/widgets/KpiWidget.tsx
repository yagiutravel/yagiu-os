import type { DashboardKpi } from "@/types/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type KpiWidgetProps = {
  kpi: DashboardKpi;
};

const KPI_ITEMS: {
  key: keyof DashboardKpi;
  label: string;
  suffix?: string;
}[] = [
  { key: "clienti", label: "Clienti" },
  { key: "tour", label: "Tour" },
  { key: "partecipanti", label: "Partecipanti" },
  { key: "camere", label: "Camere" },
  { key: "postiOccupati", label: "Posti occupati" },
  { key: "postiDisponibili", label: "Posti disponibili" },
  {
    key: "percentualeOccupazioneMedia",
    label: "Occupazione media",
    suffix: "%",
  },
];

export function KpiWidget({ kpi }: KpiWidgetProps) {
  return (
    <DashboardWidget
      title="KPI"
      description="Panoramica numerica del workspace."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {KPI_ITEMS.map((item) => (
          <div
            key={item.key}
            className="rounded-xl bg-zinc-50/60 px-4 py-3.5 ring-1 ring-inset ring-zinc-200/50 transition-colors duration-200 hover:bg-white"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {item.label}
            </p>
            <p className="mt-1.5 text-xl font-semibold text-zinc-900">
              {kpi[item.key]}
              {item.suffix ?? ""}
            </p>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
}
