"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import type { DashboardDocumenti } from "@/types/dashboard";
import { DashboardWidget } from "../DashboardWidget";

type DocumentiWidgetProps = {
  documenti: DashboardDocumenti;
};

const ITEMS: {
  key: keyof DashboardDocumenti;
  label: string;
}[] = [
  { key: "passaportiMancanti", label: "Passaporti mancanti" },
  { key: "questionariMancanti", label: "Questionari mancanti" },
  { key: "assicurazioniMancanti", label: "Assicurazioni mancanti" },
  { key: "liberatorieMancanti", label: "Liberatorie mancanti" },
];

export function DocumentiWidget({ documenti }: DocumentiWidgetProps) {
  const router = useRouter();

  return (
    <DashboardWidget
      title="Documenti"
      description="Documentazione viaggiatori da completare."
      href="/clienti"
    >
      <button
        type="button"
        onClick={() => router.push("/clienti")}
        className="w-full space-y-2 text-left transition-opacity duration-200 hover:opacity-90"
      >
        {ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-xl bg-zinc-50/60 px-4 py-3 ring-1 ring-inset ring-zinc-200/50 transition-colors duration-200 hover:bg-white"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
              <span className="text-sm text-zinc-700">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-zinc-900">
              {documenti[item.key]}
            </span>
          </div>
        ))}
      </button>
    </DashboardWidget>
  );
}
