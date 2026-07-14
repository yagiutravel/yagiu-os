import { formatComunicazioneData } from "@/models/comunicazione";
import type { ComunicazioneView } from "@/types/comunicazione";
import { ComunicazioneCanaleBadge } from "./ComunicazioneCanaleBadge";
import { ComunicazioneStatoBadge } from "./ComunicazioneStatoBadge";

type ComunicazioneListItemProps = {
  item: ComunicazioneView;
};

export function ComunicazioneListItem({ item }: ComunicazioneListItemProps) {
  const dataLabel = item.inviataIl
    ? `Inviata ${formatComunicazioneData(item.inviataIl)}`
    : item.programmataIl
      ? `Programmata ${formatComunicazioneData(item.programmataIl)}`
      : "In attesa di invio";

  return (
    <li className="rounded-xl border border-zinc-200/70 bg-zinc-50/40 px-4 py-3.5 transition-colors duration-200 hover:bg-zinc-50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900">{item.oggetto}</p>
          <p className="mt-1 text-sm text-zinc-600">{item.anteprima}</p>
          <p className="mt-2 text-xs text-zinc-500">{item.clienteNome}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ComunicazioneCanaleBadge canale={item.canale} />
          <ComunicazioneStatoBadge stato={item.stato} />
        </div>
      </div>
      <p className="mt-2.5 text-xs text-zinc-400">{dataLabel}</p>
    </li>
  );
}
