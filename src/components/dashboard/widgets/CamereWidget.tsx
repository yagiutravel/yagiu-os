"use client";

import { useRouter } from "next/navigation";
import { BedDouble } from "lucide-react";
import type { DashboardCamere } from "@/types/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type CamereWidgetProps = {
  camere: DashboardCamere;
};

export function CamereWidget({ camere }: CamereWidgetProps) {
  const router = useRouter();
  const href = camere.tourIdPrioritario
    ? `/tour/${camere.tourIdPrioritario}`
    : "/tour";

  return (
    <DashboardWidget
      title="Camere"
      description="Stato rooming list dei tour attivi."
      href={href}
    >
      <button
        type="button"
        onClick={() => router.push(href)}
        className="w-full space-y-3 text-left transition-opacity duration-200 hover:opacity-90"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50/60 px-4 py-3.5 ring-1 ring-inset ring-emerald-600/10">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/70">
              Complete
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-emerald-900">
              {camere.camereComplete}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50/60 px-4 py-3.5 ring-1 ring-inset ring-amber-600/10">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700/70">
              Incomplete
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-amber-900">
              {camere.camereIncomplete}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-zinc-50/60 px-4 py-3 ring-1 ring-inset ring-zinc-200/50">
            <span className="text-sm text-zinc-700">Posti disponibili</span>
            <span className="text-sm font-semibold text-zinc-900">
              {camere.postiDisponibili}
            </span>
          </div>
          {camere.overbooking > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-red-200/60 bg-red-50/50 px-4 py-3">
              <span className="text-sm text-red-700">Overbooking</span>
              <span className="text-sm font-semibold text-red-900">
                {camere.overbooking}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <BedDouble className="h-3.5 w-3.5" strokeWidth={1.75} />
          Apri rooming list
        </div>
      </button>
    </DashboardWidget>
  );
}
