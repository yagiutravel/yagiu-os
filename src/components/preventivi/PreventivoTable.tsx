"use client";

import Link from "next/link";
import { formatTourDate } from "@/lib/tour/utils";
import type { PreventivoListItem } from "@/types/preventivo";
import { PreventivoStatoBadge } from "./PreventivoStatoBadge";

type PreventivoTableProps = {
  items: PreventivoListItem[];
  onRowClick?: (item: PreventivoListItem) => void;
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function PreventivoTable({ items, onRowClick }: PreventivoTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white">
      <table className="min-w-full divide-y divide-zinc-100">
        <thead className="bg-zinc-50/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Numero
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Tour
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Stato
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Totale
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Creato
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((item) => (
            <tr
              key={item.id}
              className="cursor-pointer transition-colors hover:bg-zinc-50/80"
              onClick={() => onRowClick?.(item)}
            >
              <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                <Link href={`/preventivi/${item.id}`} className="hover:underline">
                  {item.numero}
                </Link>
                {item.titolo && (
                  <p className="mt-0.5 text-xs text-zinc-500">{item.titolo}</p>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-700">{item.clienteNome}</td>
              <td className="px-4 py-3 text-sm text-zinc-600">
                {item.tourNome ?? "—"}
              </td>
              <td className="px-4 py-3">
                <PreventivoStatoBadge stato={item.stato} />
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900">
                {formatEuro(item.totale)}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-500">
                {formatTourDate(item.creatoIl.slice(0, 10))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
