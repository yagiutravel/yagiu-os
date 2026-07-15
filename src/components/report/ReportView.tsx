"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileBarChart } from "lucide-react";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { formatOraRelativa } from "@/models/dashboard";
import { getDashboardData } from "@/services/dashboard.service";
import { getErrorMessage } from "@/shared/utils/error";
import { useToast } from "@/components/ui/Toast";
import type { DashboardData } from "@/types/dashboard";

export function ReportView() {
  const router = useRouter();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (error) {
      showToast(
        `Impossibile caricare il report. ${getErrorMessage(error)}`,
        "error",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    startTransition(() => {
      void loadReport();
    });
  }, [mounted, loadReport]);

  return (
    <PageContent>
      <Card>
        <CardHeader
          title="Report operativo"
          description="KPI aggregati da clienti, tour, camere e partecipazioni (stesso dataset della dashboard)."
          action={
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/15">
              <FileBarChart className="h-4 w-4" strokeWidth={1.75} />
            </div>
          }
        />
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="h-5 w-5" />
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Clienti", value: String(data.kpi.clienti) },
                  { label: "Tour attivi", value: String(data.kpi.tour) },
                  { label: "Partecipanti", value: String(data.kpi.partecipanti) },
                  {
                    label: "Occupazione media",
                    value: `${data.kpi.percentualeOccupazioneMedia}%`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200/70 bg-zinc-50/40 p-4"
                  >
                    <p className="text-sm text-zinc-500">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-zinc-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                  Attività recenti
                </h3>
                <div className="space-y-2">
                  {data.attivitaRecenti.length === 0 ? (
                    <p className="rounded-lg border border-zinc-200/70 px-4 py-6 text-center text-sm text-zinc-500">
                      Nessuna attività recente.
                    </p>
                  ) : (
                    data.attivitaRecenti.slice(0, 8).map((item) => {
                      const content = (
                        <>
                          <p className="text-sm font-medium text-zinc-900">
                            {item.descrizione}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {formatOraRelativa(item.ora)}
                          </p>
                        </>
                      );

                      if (item.href) {
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => router.push(item.href!)}
                            className="w-full rounded-lg border border-zinc-200/70 px-4 py-3 text-left transition-colors hover:bg-zinc-50"
                          >
                            {content}
                          </button>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border border-zinc-200/70 px-4 py-3"
                        >
                          {content}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <p className="text-sm text-zinc-500">
                Per il dettaglio completo visita la{" "}
                <Link href="/" className="font-medium text-zinc-900 hover:underline">
                  Dashboard
                </Link>
                .
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </PageContent>
  );
}
