"use client";

import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIE_DOCUMENTO_TOUR } from "@/mappers/tour-documento.mapper";
import {
  deleteDocumento,
  getDocumentiByTourId,
  uploadDocumento,
} from "@/services/tour-documento.service";
import type { CategoriaDocumentoTour, TourDocumento } from "@/types/tour-documento";
import { getErrorMessage } from "@/shared/utils/error";

type TourSchedaDocumentiProps = {
  tourId: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TourSchedaDocumenti({ tourId }: TourSchedaDocumentiProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documenti, setDocumenti] = useState<TourDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TourDocumento | null>(null);
  const [categoria, setCategoria] = useState<CategoriaDocumentoTour>("Contratto");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getDocumentiByTourId(tourId);
      setDocumenti(items);
    } catch (error) {
      showToast(`Impossibile caricare i documenti. ${getErrorMessage(error)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, tourId]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const documento = await uploadDocumento({
        tourId,
        nome: file.name,
        categoria,
        file,
      });
      setDocumenti((current) => [documento, ...current]);
      showToast("Documento caricato.", "success");
    } catch (error) {
      showToast(`Caricamento non riuscito. ${getErrorMessage(error)}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await deleteDocumento(confirmDelete.id);
      setDocumenti((current) =>
        current.filter((item) => item.id !== confirmDelete.id),
      );
      showToast("Documento eliminato.", "success");
    } catch (error) {
      showToast(`Eliminazione non riuscita. ${getErrorMessage(error)}`, "error");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Documenti del tour"
          description="Contratti, assicurazioni e documentazione operativa archiviata su Supabase Storage."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoria}
                onChange={(event) =>
                  setCategoria(event.target.value as CategoriaDocumentoTour)
                }
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
              >
                {CATEGORIE_DOCUMENTO_TOUR.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                {uploading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Carica file
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => void handleFileChange(event)}
              />
            </div>
          }
        />
        <CardContent>
          {documenti.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nessun documento"
              description="Carica contratti, assicurazioni o altri file relativi al tour."
              actionLabel="Carica file"
              onAction={handleUploadClick}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white">
              <ul className="divide-y divide-zinc-100">
                {documenti.map((documento) => (
                  <li
                    key={documento.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {documento.nome}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {documento.categoria} · {formatFileSize(documento.dimensioneBytes)}{" "}
                        · {formatData(documento.caricatoIl)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={documento.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        <Download className="h-4 w-4" />
                        Scarica
                      </a>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setConfirmDelete(documento)}
                        disabled={deletingId === documento.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Elimina documento"
        description={
          confirmDelete
            ? `Vuoi eliminare "${confirmDelete.nome}"? L'operazione non è reversibile.`
            : ""
        }
        confirmLabel="Elimina"
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirmDelete(null)}
        loading={Boolean(deletingId)}
      />
    </>
  );
}
