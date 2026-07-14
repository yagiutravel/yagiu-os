"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, SearchX } from "lucide-react";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import {
  getPagamentiOverview,
  type PagamentoOverviewItem,
} from "@/services/pagamento.service";
import { getErrorMessage } from "@/shared/utils/error";
import { useToast } from "@/components/ui/Toast";
import { TourStatoBadge } from "@/components/tour/TourStatoBadge";

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PagamentiOverviewView() {
  const { showToast } = useToast();
  const [items, setItems] = useState<PagamentoOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getPagamentiOverview()
      .then(setItems)
      .catch((error) =>
        showToast(`Impossibile caricare i pagamenti. ${getErrorMessage(error)}`, "error"),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  const totals = items.reduce(
    (acc, item) => ({
      incassato: acc.incassato + item.riepilogo.incassato,
      inSospeso: acc.inSospeso + item.riepilogo.residuoDaIncassare,
    }),
    { incassato: 0, inSospeso: 0 },
  );

  return (
    <PageContent>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-zinc-500">Incassato</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900">
                {formatEuro(totals.incassato)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-zinc-500">In sospeso</p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">
                {formatEuro(totals.inSospeso)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Pagamenti per tour"
            description="Riepilogo incassi e saldi residui sui tour attivi."
            action={
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/15">
                <CreditCard className="h-4 w-4" strokeWidth={1.75} />
              </div>
            }
          />
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner className="h-5 w-5" />
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="Nessun pagamento registrato"
                description="I pagamenti dei tour attivi compariranno qui."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      <th className="px-3 py-3">Tour</th>
                      <th className="px-3 py-3">Stato</th>
                      <th className="px-3 py-3">Incassato</th>
                      <th className="px-3 py-3">In sospeso</th>
                      <th className="px-3 py-3">Totale tour</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {items.map((item) => (
                      <tr key={item.tourId} className="hover:bg-zinc-50/80">
                        <td className="px-3 py-3">
                          <Link
                            href={`/tour/${item.tourId}`}
                            className="font-medium text-zinc-900 hover:underline"
                          >
                            {item.nomeTour}
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <TourStatoBadge stato={item.stato} />
                        </td>
                        <td className="px-3 py-3 text-zinc-700">
                          {formatEuro(item.riepilogo.incassato)}
                        </td>
                        <td className="px-3 py-3 text-amber-700">
                          {formatEuro(item.riepilogo.residuoDaIncassare)}
                        </td>
                        <td className="px-3 py-3 text-zinc-700">
                          {formatEuro(item.riepilogo.totaleTour)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
