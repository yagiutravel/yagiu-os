"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Plus, SearchX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { TOUR_PAGE_SIZE } from "@/lib/tour/constants";
import { processTours } from "@/lib/tour/utils";
import {
  archiveTour,
  deleteTour,
  getTours,
} from "@/services/tour.service";
import { invalidateDashboardCache } from "@/services/dashboard.service";
import { getErrorMessage } from "@/shared/utils/error";
import type { Tour, TourStatoFilter } from "@/types/tour";
import { TourTable } from "./TourTable";
import { TourToolbar } from "./TourToolbar";

export function TourView() {
  const router = useRouter();
  const { showToast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statoFilter, setStatoFilter] = useState<TourStatoFilter>("tutti");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Tour | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Tour | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTours = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTours();
      setTours(data);
    } catch (error) {
      showToast(`Impossibile caricare i tour. ${getErrorMessage(error)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadTours();
    });
  }, [loadTours, refreshKey]);

  const processed = useMemo(
    () =>
      processTours(tours, {
        search,
        stato: statoFilter,
        page,
      }),
    [tours, search, statoFilter, page],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatoChange = (stato: TourStatoFilter) => {
    setStatoFilter(stato);
    setPage(1);
  };

  const handleRowClick = useCallback(
    (tour: Tour) => {
      router.push(`/tour/${tour.id}`);
    },
    [router],
  );

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setActionLoading(true);
    try {
      await archiveTour(archiveTarget.id);
      invalidateDashboardCache();
      showToast(`"${archiveTarget.nomeTour}" archiviato.`, "success");
      setArchiveTarget(null);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      showToast(`Impossibile archiviare il tour. ${getErrorMessage(error)}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteTour(deleteTarget.id);
      invalidateDashboardCache();
      showToast(`"${deleteTarget.nomeTour}" eliminato.`, "success");
      setDeleteTarget(null);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      showToast(`Impossibile eliminare il tour. ${getErrorMessage(error)}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const noResults = !loading && processed.totalItems === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Tour"
        description="Gestisci catalogo tour, disponibilità e assegnazione tour leader."
        action={
          <Link href="/tour/nuovo">
            <Button>
              <Plus className="h-4 w-4" />
              Nuovo tour
            </Button>
          </Link>
        }
      />

      <PageContent>
        <TourToolbar
          search={search}
          stato={statoFilter}
          resultCount={processed.totalItems}
          onSearchChange={handleSearchChange}
          onStatoChange={handleStatoChange}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-5 w-5" />
          </div>
        ) : noResults ? (
          <EmptyState
            icon={search || statoFilter !== "tutti" ? SearchX : Compass}
            title="Nessun tour trovato"
            description={
              search || statoFilter !== "tutti"
                ? "Nessun tour corrisponde ai filtri selezionati."
                : "Crea il primo tour per iniziare a gestire partecipanti, camere e pagamenti."
            }
            actionLabel={
              search || statoFilter !== "tutti" ? undefined : "Nuovo tour"
            }
            onAction={
              search || statoFilter !== "tutti"
                ? undefined
                : () => router.push("/tour/nuovo")
            }
          />
        ) : (
          <TourTable
            tours={processed.items}
            currentPage={processed.currentPage}
            totalPages={processed.totalPages}
            totalItems={processed.totalItems}
            pageSize={TOUR_PAGE_SIZE}
            onPageChange={setPage}
            onRowClick={handleRowClick}
            onEdit={(tour) => router.push(`/tour/${tour.id}/modifica`)}
            onArchive={setArchiveTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </PageContent>

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title="Archivia tour"
        description={`Vuoi archiviare "${archiveTarget?.nomeTour}"? Il tour non comparirà nelle viste operative ma resterà consultabile dal filtro Archiviato.`}
        confirmLabel="Archivia"
        loading={actionLoading}
        onConfirm={handleArchive}
        onClose={() => setArchiveTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Elimina tour"
        description={`Vuoi eliminare definitivamente "${deleteTarget?.nomeTour}"? L'operazione non può essere annullata.`}
        confirmLabel="Elimina"
        loading={actionLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
