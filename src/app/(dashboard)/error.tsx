"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Button } from "@/shared/components/ui/Button";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <PageContent>
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white px-8 py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={1.75} />
        </div>
        <h2 className="text-sm font-semibold text-zinc-900">
          Qualcosa è andato storto
        </h2>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">
          Non è stato possibile caricare questa pagina. Riprova o torna alla
          dashboard.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Riprova</Button>
          <Link href="/">
            <Button variant="secondary">Vai alla dashboard</Button>
          </Link>
        </div>
      </div>
    </PageContent>
  );
}
