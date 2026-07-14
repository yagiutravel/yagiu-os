import type { AutomazioneView } from "@/types/automazione";
import { AutomazioneFlusso } from "./AutomazioneFlusso";
import { AutomazioneStatoBadge } from "./AutomazioneStatoBadge";

type AutomazioneTableProps = {
  items: AutomazioneView[];
};

export function AutomazioneTable({ items }: AutomazioneTableProps) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        Nessun workflow trovato.
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
                  Nome
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Trigger → Azione
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Stato
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Ultima esecuzione
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
                    {item.nome}
                  </td>
                  <td className="px-4 py-3.5">
                    <AutomazioneFlusso item={item} />
                  </td>
                  <td className="px-4 py-3.5">
                    <AutomazioneStatoBadge stato={item.stato} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-600">
                    {item.ultimaEsecuzioneFormattata}
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
              <p className="text-sm font-semibold text-zinc-900">{item.nome}</p>
              <AutomazioneStatoBadge stato={item.stato} />
            </div>
            <div className="mt-3">
              <AutomazioneFlusso item={item} />
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              {item.ultimaEsecuzioneFormattata}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
