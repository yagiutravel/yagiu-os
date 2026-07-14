"use client";

import { useRouter } from "next/navigation";
import type { WhatsAppConversazioneView } from "@/types/whatsapp";
import { WhatsAppStatoBadge } from "./WhatsAppStatoBadge";

type WhatsAppConversazioniTableProps = {
  conversazioni: WhatsAppConversazioneView[];
  onInvia: (conversazione: WhatsAppConversazioneView) => void;
};

export function WhatsAppConversazioniTable({
  conversazioni,
  onInvia,
}: WhatsAppConversazioniTableProps) {
  const router = useRouter();

  if (conversazioni.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        Nessuna conversazione WhatsApp.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/80">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Cliente
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Numero
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Ultimo messaggio
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Data
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Stato
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {conversazioni.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                >
                  <td className="px-4 py-3.5 font-medium text-zinc-900">
                    {item.clienteNome}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-600">{item.numero}</td>
                  <td className="max-w-xs truncate px-4 py-3.5 text-zinc-600">
                    {item.ultimoMessaggio}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-600">
                    {item.dataFormattata}
                    <span className="block text-xs text-zinc-400">
                      {item.oraFormattata}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <WhatsAppStatoBadge stato={item.stato} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onInvia(item)}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                      >
                        Invia
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/clienti/${item.clienteId}`)}
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                      >
                        Scheda
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {conversazioni.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-zinc-200/70 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {item.clienteNome}
                </p>
                <p className="mt-0.5 text-sm text-zinc-500">{item.numero}</p>
              </div>
              <WhatsAppStatoBadge stato={item.stato} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              {item.ultimoMessaggio}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              {item.dataFormattata} · {item.oraFormattata}
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => onInvia(item)}
                className="text-xs font-medium text-emerald-700"
              >
                Invia WhatsApp
              </button>
              <button
                type="button"
                onClick={() => router.push(`/clienti/${item.clienteId}`)}
                className="text-xs font-medium text-zinc-500"
              >
                Apri scheda
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
