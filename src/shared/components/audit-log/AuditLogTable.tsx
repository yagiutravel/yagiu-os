import { User } from "lucide-react";
import { AUDIT_LOG_TIPO_CONFIG } from "@/lib/audit-log/tipo.config";
import type { AuditLogView } from "@/types/audit-log";
import { AuditLogTipoBadge } from "./AuditLogTipoBadge";

type AuditLogTableProps = {
  entries: AuditLogView[];
};

export function AuditLogTable({ entries }: AuditLogTableProps) {
  if (entries.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        Nessuna registrazione trovata.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/80">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Azione
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Utente
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Tipo
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Data
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Ora
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const config = AUDIT_LOG_TIPO_CONFIG[entry.tipo];
                const Icon = config.icon;

                return (
                  <tr
                    key={entry.id}
                    className="border-b border-zinc-100 last:border-0 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900">{entry.azione}</p>
                          <p className="mt-0.5 truncate text-xs text-zinc-500">
                            {entry.entitaLabel}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700">{entry.utente}</td>
                    <td className="px-4 py-3.5">
                      <AuditLogTipoBadge tipo={entry.tipo} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-zinc-600">
                      {entry.dataFormattata}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-zinc-600">
                      {entry.oraFormattata}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {entries.map((entry) => {
          const config = AUDIT_LOG_TIPO_CONFIG[entry.tipo];
          const Icon = config.icon;

          return (
            <article
              key={entry.id}
              className="rounded-xl border border-zinc-200/70 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900">
                    {entry.azione}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{entry.entitaLabel}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AuditLogTipoBadge tipo={entry.tipo} />
                <span className="text-xs text-zinc-500">
                  {entry.dataFormattata} · {entry.oraFormattata}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                <User className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                <span>{entry.utente}</span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
