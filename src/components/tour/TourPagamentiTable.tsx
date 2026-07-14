import { Pencil, Plus, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatImportoPagamento } from "@/models/pagamento";
import type { Pagamento, PartecipantePagamentoView } from "@/types/pagamento";
import { PagamentoStatoBadge } from "./PagamentoStatoBadge";

type TourPagamentiTableProps = {
  partecipanti: PartecipantePagamentoView[];
  onAddPagamento: (partecipante: PartecipantePagamentoView) => void;
  onEditPagamento: (
    partecipante: PartecipantePagamentoView,
    pagamento: Pagamento,
  ) => void;
  onDeletePagamento: (
    partecipante: PartecipantePagamentoView,
    pagamento: Pagamento,
  ) => void;
};

function formatDataPagamento(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TourPagamentiTable({
  partecipanti,
  onAddPagamento,
  onEditPagamento,
  onDeletePagamento,
}: TourPagamentiTableProps) {
  return (
    <div className="space-y-4">
      {partecipanti.map((partecipante) => (
        <div
          key={partecipante.partecipazioneId}
          className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <div className="border-b border-zinc-100 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={partecipante.clienteNome} size="md" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {partecipante.clienteNome}
                  </p>
                  <div className="mt-1">
                    <PagamentoStatoBadge stato={partecipante.statoPagamento} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Quota totale
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {formatImportoPagamento(partecipante.quotaTotale)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Acconto versato
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {formatImportoPagamento(partecipante.accontoVersato)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Saldo versato
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {formatImportoPagamento(partecipante.saldoVersato)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Residuo
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {formatImportoPagamento(partecipante.importoResiduo)}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => onAddPagamento(partecipante)}
              >
                <Plus className="h-4 w-4" />
                Aggiungi pagamento
              </Button>
            </div>
          </div>

          {partecipante.pagamenti.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/80">
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Data
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Tipo
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Metodo
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Importo
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {partecipante.pagamenti.map((pagamento) => (
                    <tr
                      key={pagamento.id}
                      className="transition-colors duration-200 hover:bg-zinc-50/80"
                    >
                      <td className="px-4 py-3 text-zinc-700">
                        {formatDataPagamento(pagamento.data)}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{pagamento.tipo}</td>
                      <td className="px-4 py-3 text-zinc-700">
                        {pagamento.metodo}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {formatImportoPagamento(pagamento.importo)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onEditPagamento(partecipante, pagamento)
                            }
                            aria-label="Modifica pagamento"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() =>
                              onDeletePagamento(partecipante, pagamento)
                            }
                            aria-label="Elimina pagamento"
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
          )}
        </div>
      ))}
    </div>
  );
}
