"use client";

import { useRouter } from "next/navigation";
import type { DashboardPreventivi } from "@/types/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type PreventiviWidgetProps = {
  preventivi: DashboardPreventivi;
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PreventiviWidget({ preventivi }: PreventiviWidgetProps) {
  const router = useRouter();

  return (
    <DashboardWidget
      title="Preventivi"
      description="Proposte commerciali in attesa e accettate."
      href="/preventivi"
    >
      <button
        type="button"
        onClick={() => router.push("/preventivi")}
        className="w-full text-left transition-opacity duration-200 hover:opacity-90"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-zinc-50/60 px-4 py-3.5 ring-1 ring-inset ring-zinc-200/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              In attesa
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-zinc-900">
              {preventivi.inAttesa}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50/60 px-4 py-3.5 ring-1 ring-inset ring-zinc-200/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Accettati
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-emerald-700">
              {preventivi.accettati}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50/60 px-4 py-3.5 ring-1 ring-inset ring-zinc-200/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Valore pipeline
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-fuchsia-700">
              {formatEuro(preventivi.valoreTotaleInAttesa)}
            </p>
          </div>
        </div>
      </button>
    </DashboardWidget>
  );
}
