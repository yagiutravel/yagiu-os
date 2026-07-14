"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { CameraView, CameraPartecipanteView } from "@/types/camera";

type TourSpostaPartecipanteModalProps = {
  open: boolean;
  partecipante: CameraPartecipanteView;
  camere: CameraView[];
  currentCameraId: string;
  loading: boolean;
  error?: string;
  selectedCameraId: string;
  onSelectCamera: (cameraId: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function TourSpostaPartecipanteModal({
  open,
  partecipante,
  camere,
  currentCameraId,
  loading,
  error,
  selectedCameraId,
  onSelectCamera,
  onClose,
  onSubmit,
}: TourSpostaPartecipanteModalProps) {
  const availableCamere = camere.filter(
    (camera) =>
      camera.id !== currentCameraId && camera.occupazione < camera.capienza,
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Sposta ${partecipante.clienteNome}`}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <p className="text-sm text-zinc-500">
          Seleziona la camera di destinazione.
        </p>

        {availableCamere.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/40 px-4 py-6 text-center text-sm text-zinc-500">
            Nessuna camera con posti liberi disponibile.
          </p>
        ) : (
          <div className="space-y-2">
            {availableCamere.map((camera) => {
              const isSelected = camera.id === selectedCameraId;

              return (
                <button
                  key={camera.id}
                  type="button"
                  onClick={() => onSelectCamera(camera.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${
                    isSelected
                      ? "border-zinc-300 bg-zinc-50"
                      : "border-zinc-200/70 hover:border-zinc-300/80 hover:bg-zinc-50/60"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Camera {camera.numero}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {camera.tipologia} · {camera.occupazione}/{camera.capienza}
                    </p>
                  </div>
                  <Badge variant="default">{camera.tipologia}</Badge>
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!selectedCameraId || availableCamere.length === 0}
          >
            Sposta
          </Button>
        </div>
      </form>
    </Modal>
  );
}
