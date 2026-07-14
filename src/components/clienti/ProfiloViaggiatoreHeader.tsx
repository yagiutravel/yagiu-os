import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { StatoBadge } from "@/components/ui/StatoBadge";
import type { ProfiloViaggiatore } from "@/types/profilo-viaggiatore";

type ProfiloViaggiatoreHeaderProps = {
  profilo: ProfiloViaggiatore;
  action?: ReactNode;
};

export function ProfiloViaggiatoreHeader({
  profilo,
  action,
}: ProfiloViaggiatoreHeaderProps) {
  const { profilo: anagrafica } = profilo;

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/clienti"
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-zinc-500 transition-colors duration-200 hover:bg-zinc-50 hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Clienti
        </Link>
        <span className="text-zinc-300" aria-hidden>
          /
        </span>
        <span className="truncate font-medium text-zinc-900">
          {anagrafica.nomeCompleto}
        </span>
      </nav>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <Avatar name={anagrafica.nomeCompleto} size="xl" />

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Profilo Viaggiatore
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {anagrafica.nomeCompleto}
              </h1>
              <StatoBadge stato={profilo.stato} />
            </div>
            <p className="mt-1.5 text-sm text-zinc-500">
              Viaggiatore dal{" "}
              {new Date(profilo.creatoIl).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
