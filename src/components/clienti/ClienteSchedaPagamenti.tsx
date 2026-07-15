"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { InfoGrid } from "@/components/ui/InfoGrid";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { PagamentoStatoBadge } from "@/components/tour/PagamentoStatoBadge";
import { TourStatoBadge } from "@/components/tour/TourStatoBadge";
import { formatImportoPagamento } from "@/models/pagamento";
import { getPagamentiByClienteId } from "@/services/pagamento.service";
import type {
  ClientePagamentiData,
  ClienteTourPagamentoView,
  Pagamento,
} from "@/types/pagamento";
import { getErrorMessage } from "@/shared/utils/error";

type ClienteSchedaPagamentiProps = {
  clienteId: string;
};

function formatDataPagamento(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ClientePagamentiRiepilogo({
  riepilogo,
}: {
  riepilogo: ClientePagamentiData["riepilogo"];
}) {
  return (
    <InfoGrid
      columns={2}
      fields={[
        {
          label: "Totale versato",
          value: formatImportoPagamento(riepilogo.totaleVersato),
        },
        {
          label: "Residuo da versare",
          value: formatImportoPagamento(riepilogo.importoResiduo),
        },
        {
          label: "Pagamenti registrati",
          value: String(riepilogo.numeroPagamenti),
        },
        {
          label: "Tour con saldo aperto",
          value: String(riepilogo.tourConSaldoAperto),
        },
      ]}
    />
  );
}

function ClientePagamentiTourCard({ item }: { item: ClienteTourPagamentoView }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={() => router.push(`/tour/${item.tourId}`)}
        className="flex w-full flex-col gap-3 border-b border-zinc-100 px-4 py-4 text-left transition-colors duration-200 hover:bg-zinc-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">
            {item.nomeTour}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {item.destinazione} · {item.anno}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PagamentoStatoBadge stato={item.partecipante.statoPagamento} />
          <TourStatoBadge stato={item.statoTour} />
        </div>
      </button>

      {item.partecipante.pagamenti.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {item.partecipante.pagamenti.map((pagamento: Pagamento) => (
                <tr
                  key={pagamento.id}
                  className="transition-colors duration-200 hover:bg-zinc-50/80"
                >
                  <td className="px-4 py-3 text-zinc-700">
                    {formatDataPagamento(pagamento.data)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{pagamento.tipo}</td>
                  <td className="px-4 py-3 text-zinc-700">{pagamento.metodo}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {formatImportoPagamento(pagamento.importo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-4 py-4 text-sm text-zinc-500 sm:px-5">
          Nessun pagamento registrato per questo tour.
        </p>
      )}
    </div>
  );
}

export function ClienteSchedaPagamenti({ clienteId }: ClienteSchedaPagamentiProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<ClientePagamentiData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pagamentiData = await getPagamentiByClienteId(clienteId);
      setData(pagamentiData);
    } catch (error) {
      showToast(
        `Impossibile caricare i pagamenti. ${getErrorMessage(error)}`,
        "error",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [clienteId, showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  const hasTours = (data?.perTour.length ?? 0) > 0;
  const hasPayments = (data?.riepilogo.numeroPagamenti ?? 0) > 0;

  return (
    <Card>
      <CardHeader
        title="Pagamenti"
        description="Storico pagamenti e saldi."
      />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento pagamenti...
            </div>
          </div>
        ) : !data || !hasTours ? (
          <EmptyState
            icon={CreditCard}
            title="Nessun pagamento associato"
            description="I pagamenti del viaggiatore compariranno qui."
          />
        ) : (
          <div className="space-y-8">
            <ClientePagamentiRiepilogo riepilogo={data.riepilogo} />
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-900">
                {hasPayments ? "Storico per tour" : "Saldi per tour"}
              </h3>
              <div className="space-y-4">
                {data.perTour.map((item) => (
                  <ClientePagamentiTourCard key={item.tourId} item={item} />
                ))}
              </div>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
