import type { SchedulazioneView } from "@/types/schedulazione";
import { SchedulazioneStatoBadge } from "./SchedulazioneStatoBadge";
import { SchedulazioneTipoBadge } from "./SchedulazioneTipoBadge";

type SchedulazioneTableProps = {
  items: SchedulazioneView[];
};

export function SchedulazioneTable({ items }: SchedulazioneTableProps) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        Nessuna schedulazione trovata.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-zinc-200/80 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/80">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Titolo
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Cliente
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Tour
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Tipo
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Data / Ora
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Stato
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                >
                  <td className="px-4 py-3.5 font-medium text-zinc-900">
                    {item.titolo}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-600">{item.clienteNome}</td>
                  <td className="max-w-xs truncate px-4 py-3.5 text-zinc-600">
                    {item.tourNome ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <SchedulazioneTipoBadge tipo={item.tipo} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-600">
                    {item.dataOraFormattata}
                  </td>
                  <td className="px-4 py-3.5">
                    <SchedulazioneStatoBadge stato={item.stato} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-zinc-200/70 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-zinc-900">{item.titolo}</p>
              <SchedulazioneStatoBadge stato={item.stato} />
            </div>
            <p className="mt-1 text-sm text-zinc-600">{item.clienteNome}</p>
            {item.tourNome && (
              <p className="mt-0.5 text-xs text-zinc-500">{item.tourNome}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SchedulazioneTipoBadge tipo={item.tipo} />
              <span className="text-xs text-zinc-400">
                {item.dataOraFormattata}
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
