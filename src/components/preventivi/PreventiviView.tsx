"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, SearchX } from "lucide-react";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { processPreventivi } from "@/models/preventivo";
import { listPreventivi } from "@/services/preventivo.service";
import type {
  PreventivoListItem,
  PreventivoSortDirection,
  PreventivoSortField,
  StatoPreventivoFilter,
} from "@/types/preventivo";
import { getErrorMessage } from "@/shared/utils/error";
import { PreventivoTable } from "./PreventivoTable";
import { PreventivoToolbar } from "./PreventivoToolbar";

export function PreventiviView() {
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState<PreventivoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stato, setStato] = useState<StatoPreventivoFilter>("tutti");
  const [sortField, setSortField] = useState<PreventivoSortField>("data");
  const [sortDirection, setSortDirection] = useState<PreventivoSortDirection>("desc");
  const [page, setPage] = useState(1);

  const loadPreventivi = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPreventivi();
      setItems(data);
    } catch (error) {
      showToast(`Impossibile caricare i preventivi. ${getErrorMessage(error)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadPreventivi();
    });
  }, [loadPreventivi]);

  const processed = useMemo(
    () =>
      processPreventivi(items, {
        search,
        stato,
        sortField,
        sortDirection,
        page,
      }),
    [items, search, stato, sortField, sortDirection, page],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatoChange = (value: StatoPreventivoFilter) => {
    setStato(value);
    setPage(1);
  };

  return (
    <PageContent>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div />
        <Link
          href="/preventivi/nuovo"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Nuovo preventivo
        </Link>
      </div>

      <PreventivoToolbar
        search={search}
        stato={stato}
        sortField={sortField}
        sortDirection={sortDirection}
        resultCount={processed.totalItems}
        onSearchChange={handleSearchChange}
        onStatoChange={handleStatoChange}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-5 w-5" />
        </div>
      ) : processed.totalItems === 0 ? (
        <EmptyState
          icon={search ? SearchX : FileText}
          title={search ? "Nessun risultato" : "Nessun preventivo"}
          description={
            search
              ? "Prova a modificare i filtri di ricerca."
              : "Crea il primo preventivo per un cliente o un tour."
          }
          actionLabel={search ? undefined : "Nuovo preventivo"}
          onAction={search ? undefined : () => router.push("/preventivi/nuovo")}
        />
      ) : (
        <>
          <PreventivoTable
            items={processed.items}
            onRowClick={(item) => router.push(`/preventivi/${item.id}`)}
          />
          {processed.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
              <span>
                Pagina {processed.page} di {processed.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={processed.page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Precedente
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={processed.page >= processed.totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(processed.totalPages, value + 1))
                  }
                >
                  Successiva
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </PageContent>
  );
}
