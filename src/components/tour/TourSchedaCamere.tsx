"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { BedDouble, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  EMPTY_CAMERA_FORM,
  cameraToForm,
  formToCreateInput,
} from "@/models/camera";
import {
  assignPartecipanteToCamera,
  createCamera,
  deleteCamera,
  getCamereByTourId,
  movePartecipanteToCamera,
  removePartecipanteFromCamera,
  updateCamera,
} from "@/services/camera.service";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import { getHotelsByTourId } from "@/services/tour-hotel.service";
import type {
  CameraForm,
  CameraPartecipanteView,
  CameraView,
  RoomingRiepilogo,
} from "@/types/camera";
import { computeRoomingRiepilogo } from "@/mappers/camera.mapper";
import type { PartecipazioneTourView } from "@/types/tour-partecipazione";
import type { TourHotel } from "@/types/tour-hotel";
import { TourCameraCard } from "./TourCameraCard";
import { TourCameraModal } from "./TourCameraModal";
import { TourHotelSection } from "./TourHotelSection";
import { TourRoomingRiepilogo } from "./TourRoomingRiepilogo";
import { PartecipanteCameraSearchSelect } from "./PartecipanteCameraSearchSelect";
import { TourSpostaPartecipanteModal } from "./TourSpostaPartecipanteModal";
import { getErrorMessage } from "@/shared/utils/error";

type TourSchedaCamereProps = {
  tourId: string;
};

type ModalState =
  | { type: "closed" }
  | { type: "createCamera" }
  | { type: "editCamera"; camera: CameraView }
  | { type: "deleteCamera"; camera: CameraView }
  | {
      type: "assignPartecipante";
      camera: CameraView;
    }
  | {
      type: "movePartecipante";
      camera: CameraView;
      partecipante: CameraPartecipanteView;
    }
  | {
      type: "removePartecipante";
      camera: CameraView;
      partecipante: CameraPartecipanteView;
    };


export function TourSchedaCamere({ tourId }: TourSchedaCamereProps) {
  const { showToast } = useToast();

  const [camere, setCamere] = useState<CameraView[]>([]);
  const [hotels, setHotels] = useState<TourHotel[]>([]);
  const [partecipanti, setPartecipanti] = useState<PartecipazioneTourView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "closed" });
  const [cameraForm, setCameraForm] = useState<CameraForm>(EMPTY_CAMERA_FORM);
  const [formError, setFormError] = useState<string | undefined>();
  const [selectedPartecipanteId, setSelectedPartecipanteId] = useState("");
  const [selectedTargetCameraId, setSelectedTargetCameraId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [camereData, partecipantiData, hotelsData] = await Promise.all([
        getCamereByTourId(tourId),
        getPartecipazioniByTourId(tourId),
        getHotelsByTourId(tourId),
      ]);
      setCamere(camereData);
      setPartecipanti(partecipantiData);
      setHotels(hotelsData);
    } catch (error) {
      showToast(`Impossibile caricare le camere. ${getErrorMessage(error)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, tourId]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  const riepilogo: RoomingRiepilogo = useMemo(
    () => computeRoomingRiepilogo(camere, partecipanti.length),
    [camere, partecipanti.length],
  );

  const assignedPartecipazioneIds = useMemo(() => {
    const ids = new Set<string>();
    for (const camera of camere) {
      for (const partecipante of camera.partecipanti) {
        ids.add(partecipante.partecipazioneId);
      }
    }
    return ids;
  }, [camere]);

  const unassignedPartecipanti = useMemo(
    () => partecipanti.filter((item) => !assignedPartecipazioneIds.has(item.id)),
    [assignedPartecipazioneIds, partecipanti],
  );

  const refreshCamere = async () => {
    const camereData = await getCamereByTourId(tourId);
    setCamere(camereData);
    return camereData;
  };

  const handleOpenCreateCamera = () => {
    setCameraForm(EMPTY_CAMERA_FORM);
    setFormError(undefined);
    setModal({ type: "createCamera" });
  };

  const handleOpenEditCamera = (camera: CameraView) => {
    setCameraForm(cameraToForm(camera));
    setFormError(undefined);
    setModal({ type: "editCamera", camera });
  };

  const handleOpenDeleteCamera = (camera: CameraView) => {
    setModal({ type: "deleteCamera", camera });
  };

  const handleOpenAssignPartecipante = (camera: CameraView) => {
    setSelectedPartecipanteId("");
    setFormError(undefined);
    setModal({ type: "assignPartecipante", camera });
  };

  const handleOpenMovePartecipante = (
    camera: CameraView,
    partecipante: CameraPartecipanteView,
  ) => {
    setSelectedTargetCameraId("");
    setFormError(undefined);
    setModal({ type: "movePartecipante", camera, partecipante });
  };

  const handleOpenRemovePartecipante = (
    camera: CameraView,
    partecipante: CameraPartecipanteView,
  ) => {
    setModal({ type: "removePartecipante", camera, partecipante });
  };

  const handleCloseModal = () => {
    if (!saving && !deleting) {
      setModal({ type: "closed" });
      setFormError(undefined);
    }
  };

  const handleCameraSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(undefined);

    try {
      if (modal.type === "createCamera") {
        const created = await createCamera(formToCreateInput(tourId, cameraForm));
        setCamere((prev) =>
          [...prev, created].sort((a, b) =>
            a.numero.localeCompare(b.numero, "it", { numeric: true }),
          ),
        );
        showToast(`Camera ${created.numero} creata.`);
      } else if (modal.type === "editCamera") {
        const updated = await updateCamera(modal.camera.id, {
          numero: cameraForm.numero,
          tipologia: cameraForm.tipologia,
          note: cameraForm.note,
        });
        setCamere((prev) =>
          prev
            .map((item) => (item.id === updated.id ? updated : item))
            .sort((a, b) =>
              a.numero.localeCompare(b.numero, "it", { numeric: true }),
            ),
        );
        showToast(`Camera ${updated.numero} aggiornata.`);
      }

      setModal({ type: "closed" });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (modal.type !== "assignPartecipante") return;

    if (!selectedPartecipanteId) {
      setFormError("Seleziona un partecipante.");
      return;
    }

    setSaving(true);
    setFormError(undefined);

    try {
      const updated = await assignPartecipanteToCamera(
        modal.camera.id,
        selectedPartecipanteId,
      );
      setCamere((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      const partecipante = partecipanti.find(
        (item) => item.id === selectedPartecipanteId,
      );
      showToast(
        `${partecipante?.clienteNome ?? "Partecipante"} assegnato alla camera ${updated.numero}.`,
      );
      setModal({ type: "closed" });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleMoveSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (modal.type !== "movePartecipante") return;

    if (!selectedTargetCameraId) {
      setFormError("Seleziona una camera di destinazione.");
      return;
    }

    setSaving(true);
    setFormError(undefined);

    try {
      await movePartecipanteToCamera(
        modal.partecipante.partecipazioneId,
        selectedTargetCameraId,
      );
      await refreshCamere();
      showToast(
        `${modal.partecipante.clienteNome} spostato nella nuova camera.`,
      );
      setModal({ type: "closed" });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCameraConfirm = async () => {
    if (modal.type !== "deleteCamera") return;

    setDeleting(true);
    const target = modal.camera;

    try {
      await deleteCamera(target.id);
      setCamere((prev) => prev.filter((item) => item.id !== target.id));
      showToast(`Camera ${target.numero} eliminata.`);
      setModal({ type: "closed" });
    } catch (error) {
      showToast(`Impossibile eliminare la camera. ${getErrorMessage(error)}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleRemovePartecipanteConfirm = async () => {
    if (modal.type !== "removePartecipante") return;

    setDeleting(true);
    const { partecipante, camera } = modal;

    try {
      await removePartecipanteFromCamera(partecipante.partecipazioneId);
      await refreshCamere();
      showToast(
        `${partecipante.clienteNome} rimosso dalla camera ${camera.numero}.`,
      );
      setModal({ type: "closed" });
    } catch (error) {
      showToast(
        `Impossibile rimuovere il partecipante. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <TourHotelSection
          tourId={tourId}
          onHotelsChanged={() => {
            void getHotelsByTourId(tourId).then(setHotels);
          }}
        />

        <Card>
          <CardHeader
            title="Rooming List"
            description="Gestione camere e assegnazione partecipanti del tour."
            action={
              <Button size="sm" onClick={handleOpenCreateCamera} disabled={loading}>
                <Plus className="h-4 w-4" />
                Nuova Camera
              </Button>
            }
          />
          <CardContent className="space-y-6">
            {!loading && camere.length > 0 && (
              <TourRoomingRiepilogo riepilogo={riepilogo} />
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Spinner className="h-5 w-5" />
                  Caricamento camere...
                </div>
              </div>
            ) : camere.length === 0 ? (
              <EmptyState
                icon={BedDouble}
                title="Nessuna camera creata"
                description="Inizia creando la prima camera."
                actionLabel="Nuova Camera"
                onAction={handleOpenCreateCamera}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {camere.map((camera) => (
                  <TourCameraCard
                    key={camera.id}
                    camera={camera}
                    canAddPartecipante={unassignedPartecipanti.length > 0}
                    onEdit={handleOpenEditCamera}
                    onDelete={handleOpenDeleteCamera}
                    onAddPartecipante={handleOpenAssignPartecipante}
                    onMovePartecipante={handleOpenMovePartecipante}
                    onRemovePartecipante={handleOpenRemovePartecipante}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(modal.type === "createCamera" || modal.type === "editCamera") && (
        <TourCameraModal
          open
          mode={modal.type === "createCamera" ? "create" : "edit"}
          form={cameraForm}
          hotels={hotels}
          loading={saving}
          error={formError}
          onClose={handleCloseModal}
          onFormChange={setCameraForm}
          onSubmit={handleCameraSubmit}
        />
      )}

      {modal.type === "assignPartecipante" && (
        <Modal
          open
          onClose={handleCloseModal}
          title={`Aggiungi partecipante — Camera ${modal.camera.numero}`}
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4" noValidate>
            <PartecipanteCameraSearchSelect
              partecipanti={unassignedPartecipanti}
              selectedId={selectedPartecipanteId}
              disabled={saving}
              onSelect={setSelectedPartecipanteId}
            />

            {formError && <p className="text-xs text-red-500">{formError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
                disabled={saving}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                loading={saving}
                disabled={!selectedPartecipanteId}
              >
                Aggiungi
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modal.type === "movePartecipante" && (
        <TourSpostaPartecipanteModal
          open
          partecipante={modal.partecipante}
          camere={camere}
          currentCameraId={modal.camera.id}
          loading={saving}
          error={formError}
          selectedCameraId={selectedTargetCameraId}
          onSelectCamera={setSelectedTargetCameraId}
          onClose={handleCloseModal}
          onSubmit={handleMoveSubmit}
        />
      )}

      {modal.type === "deleteCamera" && (
        <ConfirmDialog
          open
          title="Elimina camera"
          description={`Sei sicuro di voler eliminare la camera ${modal.camera.numero}? I partecipanti assegnati torneranno disponibili per una nuova assegnazione.`}
          confirmLabel="Elimina"
          loading={deleting}
          onConfirm={handleDeleteCameraConfirm}
          onClose={() => {
            if (!deleting) setModal({ type: "closed" });
          }}
        />
      )}

      {modal.type === "removePartecipante" && (
        <ConfirmDialog
          open
          title="Rimuovi dalla camera"
          description={`Rimuovere "${modal.partecipante.clienteNome}" dalla camera ${modal.camera.numero}? Il partecipante resterà iscritto al tour.`}
          confirmLabel="Rimuovi"
          loading={deleting}
          onConfirm={handleRemovePartecipanteConfirm}
          onClose={() => {
            if (!deleting) setModal({ type: "closed" });
          }}
        />
      )}
    </>
  );
}
