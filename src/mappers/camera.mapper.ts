import {
  enrichCameraView,
  getCapienzaFromTipologia,
} from "@/models/camera";
import type { PartecipazioneTourView } from "@/types/tour-partecipazione";
import type {
  Camera,
  CameraAssegnazione,
  CameraPartecipanteView,
  CameraView,
  RoomingRiepilogo,
} from "@/types/camera";

function mapAssegnazioneToPartecipanteView(
  assegnazione: CameraAssegnazione,
  partecipazioni: PartecipazioneTourView[],
): CameraPartecipanteView | null {
  const partecipazione = partecipazioni.find(
    (item) => item.id === assegnazione.partecipazioneId,
  );

  if (!partecipazione) return null;

  return {
    assegnazioneId: assegnazione.id,
    partecipazioneId: partecipazione.id,
    clienteId: partecipazione.clienteId,
    clienteNome: partecipazione.clienteNome,
    ruolo: partecipazione.ruolo,
  };
}

export function mapCameraToView(
  camera: Camera,
  assegnazioni: CameraAssegnazione[],
  partecipazioni: PartecipazioneTourView[],
): CameraView {
  const cameraAssegnazioni = assegnazioni.filter(
    (item) => item.cameraId === camera.id,
  );

  const partecipanti = cameraAssegnazioni
    .map((item) => mapAssegnazioneToPartecipanteView(item, partecipazioni))
    .filter((item): item is CameraPartecipanteView => item !== null)
    .sort((a, b) => a.clienteNome.localeCompare(b.clienteNome, "it"));

  return enrichCameraView(camera, partecipanti);
}

export function mapCamereToViews(
  camere: Camera[],
  assegnazioni: CameraAssegnazione[],
  partecipazioni: PartecipazioneTourView[],
): CameraView[] {
  return camere
    .map((camera) => mapCameraToView(camera, assegnazioni, partecipazioni))
    .sort((a, b) =>
      a.numero.localeCompare(b.numero, "it", { numeric: true }),
    );
}

export function computeRoomingRiepilogo(
  camere: CameraView[],
  partecipantiTotali: number,
): RoomingRiepilogo {
  const postiTotali = camere.reduce((sum, camera) => sum + camera.capienza, 0);
  const postiOccupati = camere.reduce(
    (sum, camera) => sum + camera.occupazione,
    0,
  );

  return {
    camere: camere.length,
    partecipanti: partecipantiTotali,
    postiOccupati,
    postiLiberi: Math.max(postiTotali - postiOccupati, 0),
    camereComplete: camere.filter((camera) => camera.statoOccupazione === "Completa")
      .length,
    camereIncomplete: camere.filter(
      (camera) =>
        camera.statoOccupazione === "Parziale" ||
        camera.statoOccupazione === "Vuota",
    ).length,
  };
}

export function canAssignToCamera(
  camera: Camera,
  currentOccupazione: number,
): boolean {
  const capienza = getCapienzaFromTipologia(camera.tipologia);
  return currentOccupazione < capienza;
}
