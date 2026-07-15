"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  archiveTour,
  deleteTour,
} from "@/services/tour.service";
import { invalidateDashboardCache } from "@/services/dashboard.service";
import { getErrorMessage } from "@/shared/utils/error";
import type { TourDettaglio } from "@/types/tour-scheda";
import { TourStatoBadge } from "./TourStatoBadge";

type TourSchedaActionsProps = {
  tour: TourDettaglio;
  onChanged: () => void;
};

export function TourSchedaActions({ tour, onChanged }: TourSchedaActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    setLoading(true);
    try {
      await archiveTour(tour.id);
      invalidateDashboardCache();
      showToast("Tour archiviato.", "success");
      setArchiveOpen(false);
      onChanged();
    } catch (error) {
      showToast(`Impossibile archiviare il tour. ${getErrorMessage(error)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTour(tour.id);
      invalidateDashboardCache();
      showToast("Tour eliminato.", "success");
      router.push("/tour");
    } catch (error) {
      showToast(`Impossibile eliminare il tour. ${getErrorMessage(error)}`, "error");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <TourStatoBadge stato={tour.stato} />
        <Link href={`/tour/${tour.id}/modifica`}>
          <Button variant="secondary" size="sm">
            <Pencil className="h-4 w-4" />
            Modifica
          </Button>
        </Link>
        {tour.stato !== "Archiviato" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setArchiveOpen(true)}
          >
            <Archive className="h-4 w-4" />
            Archivia
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="text-red-600 hover:text-red-700"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Elimina
        </Button>
        <Link href="/tour">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Elenco tour
          </Button>
        </Link>
      </div>

      <ConfirmDialog
        open={archiveOpen}
        title="Archivia tour"
        description={`Vuoi archiviare "${tour.nomeTour}"?`}
        confirmLabel="Archivia"
        loading={loading}
        onConfirm={handleArchive}
        onClose={() => setArchiveOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Elimina tour"
        description={`Vuoi eliminare definitivamente "${tour.nomeTour}"?`}
        confirmLabel="Elimina"
        loading={loading}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
