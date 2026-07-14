import { Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { PartecipazioneTourView } from "@/types/tour-partecipazione";
import { PartecipazioneBadge } from "./PartecipazioneBadge";

type TourPartecipantiTableProps = {
  partecipanti: PartecipazioneTourView[];
  onClienteClick: (clienteId: string) => void;
  onEdit: (partecipazione: PartecipazioneTourView) => void;
  onDelete: (partecipazione: PartecipazioneTourView) => void;
};

export function TourPartecipantiTable({
  partecipanti,
  onClienteClick,
  onEdit,
  onDelete,
}: TourPartecipantiTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Partecipante
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Ruolo
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Pagamento
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Documenti
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Questionario
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Note
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {partecipanti.map((partecipante) => (
              <tr
                key={partecipante.id}
                className="transition-colors duration-200 hover:bg-zinc-50/80"
              >
                <td className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => onClienteClick(partecipante.clienteId)}
                    className="flex items-center gap-3 text-left transition-colors duration-200 hover:text-zinc-900"
                  >
                    <Avatar name={partecipante.clienteNome} size="md" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">
                        {partecipante.clienteNome}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {partecipante.clienteEmail}
                      </p>
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <PartecipazioneBadge kind="ruolo" value={partecipante.ruolo} />
                </td>
                <td className="px-4 py-3.5">
                  <PartecipazioneBadge
                    kind="pagamento"
                    value={partecipante.pagamento}
                  />
                </td>
                <td className="px-4 py-3.5">
                  <PartecipazioneBadge
                    kind="documenti"
                    value={partecipante.documenti}
                  />
                </td>
                <td className="px-4 py-3.5">
                  <PartecipazioneBadge
                    kind="questionario"
                    value={partecipante.questionario}
                  />
                </td>
                <td className="max-w-[220px] px-4 py-3.5">
                  <p className="truncate text-zinc-600">
                    {partecipante.note || "—"}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(partecipante)}
                      aria-label={`Modifica ${partecipante.clienteNome}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(partecipante)}
                      aria-label={`Rimuovi ${partecipante.clienteNome}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
