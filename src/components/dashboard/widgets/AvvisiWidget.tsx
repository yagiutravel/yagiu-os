"use client";

import { useRouter } from "next/navigation";
import type { DashboardAvviso } from "@/types/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type AvvisiWidgetProps = {
  avvisi: DashboardAvviso[];
};

const LIVELLO_STYLES = {
  critico: "border-red-200/60 bg-red-50/40 hover:bg-red-50/70",
  attenzione: "border-amber-200/60 bg-amber-50/40 hover:bg-amber-50/70",
  avviso: "border-yellow-200/60 bg-yellow-50/40 hover:bg-yellow-50/70",
  info: "border-sky-200/60 bg-sky-50/40 hover:bg-sky-50/70",
  success: "border-emerald-200/60 bg-emerald-50/40 hover:bg-emerald-50/70",
} as const;

export function AvvisiWidget({ avvisi }: AvvisiWidgetProps) {
  const router = useRouter();

  return (
    <DashboardWidget
      title="Centro avvisi"
      description="Notifiche operative che richiedono azione."
    >
      {avvisi.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Nessun avviso al momento.
        </p>
      ) : (
        <div className="space-y-2">
          {avvisi.map((avviso) => (
            <button
              key={avviso.id}
              type="button"
              onClick={() => router.push(avviso.href)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${LIVELLO_STYLES[avviso.livello]}`}
            >
              <span className="text-base">{avviso.emoji}</span>
              <span className="text-sm font-medium text-zinc-900">
                {avviso.messaggio}
              </span>
            </button>
          ))}
        </div>
      )}
    </DashboardWidget>
  );
}
