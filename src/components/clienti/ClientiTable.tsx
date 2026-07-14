import { Pencil, Trash2 } from "lucide-react";
import { StatoBadge } from "@/components/ui/StatoBadge";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import type { Cliente } from "@/types/cliente";

type ClientiTableProps = {
  clienti: Cliente[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  actionsDisabled?: boolean;
  onPageChange: (page: number) => void;
  onRowClick: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
};

export function ClientiTable({
  clienti,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  actionsDisabled = false,
  onPageChange,
  onRowClick,
  onEdit,
  onDelete,
}: ClientiTableProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm ${actionsDisabled ? "pointer-events-none opacity-60" : ""}`}
      aria-disabled={actionsDisabled}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/80">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Nome
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Telefono
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Azienda
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Stato
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Creato il
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {clienti.map((cliente) => (
              <tr
                key={cliente.id}
                className="group cursor-pointer transition-colors hover:bg-zinc-50/80"
                onClick={() => onRowClick(cliente)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(cliente);
                  }
                }}
                tabIndex={actionsDisabled ? -1 : 0}
                role="link"
                aria-label={`Apri scheda di ${cliente.nome}`}
              >
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {cliente.nome}
                </td>
                <td className="px-4 py-3 text-zinc-600">{cliente.email}</td>
                <td className="px-4 py-3 text-zinc-600">{cliente.telefono}</td>
                <td className="px-4 py-3 text-zinc-600">{cliente.azienda}</td>
                <td className="px-4 py-3">
                  <StatoBadge stato={cliente.stato} />
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(cliente.creatoIl).toLocaleDateString("it-IT")}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(cliente)}
                      disabled={actionsDisabled}
                      aria-label={`Modifica ${cliente.nome}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(cliente)}
                      disabled={actionsDisabled}
                      aria-label={`Elimina ${cliente.nome}`}
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        disabled={actionsDisabled}
        onPageChange={onPageChange}
      />
    </div>
  );
}
