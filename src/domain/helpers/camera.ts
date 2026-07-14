import {
  getCapienzaFromTipologia,
  getStatoOccupazione,
} from "@/models/camera";
import type { Camera, CameraAssegnazione } from "@/types/camera";

export { getCapienzaFromTipologia, getStatoOccupazione };

export function countAssegnazioniForCamera(
  cameraId: string,
  assegnazioni: CameraAssegnazione[],
): number {
  return assegnazioni.filter((item) => item.cameraId === cameraId).length;
}

export function getCameraOccupazione(
  camera: Camera,
  assegnazioni: CameraAssegnazione[],
): number {
  return countAssegnazioniForCamera(camera.id, assegnazioni);
}

export function getCameraCapienza(camera: Camera): number {
  return getCapienzaFromTipologia(camera.tipologia);
}

export function getCameraPostiLiberi(
  camera: Camera,
  assegnazioni: CameraAssegnazione[],
): number {
  const capienza = getCameraCapienza(camera);
  const occupazione = getCameraOccupazione(camera, assegnazioni);
  return Math.max(capienza - occupazione, 0);
}

export function isCameraComplete(
  camera: Camera,
  assegnazioni: CameraAssegnazione[],
): boolean {
  const capienza = getCameraCapienza(camera);
  const occupazione = getCameraOccupazione(camera, assegnazioni);
  return getStatoOccupazione(occupazione, capienza) === "Completa";
}

export function isCameraIncomplete(
  camera: Camera,
  assegnazioni: CameraAssegnazione[],
): boolean {
  return !isCameraComplete(camera, assegnazioni);
}

export function canAssignToCamera(
  camera: Camera,
  assegnazioni: CameraAssegnazione[],
): boolean {
  return getCameraPostiLiberi(camera, assegnazioni) > 0;
}

export function sortCamereByNumero(camere: Camera[]): Camera[] {
  return [...camere].sort((a, b) =>
    a.numero.localeCompare(b.numero, "it", { numeric: true }),
  );
}

export function hasCameraOverbooking(
  camera: Camera,
  assegnazioni: CameraAssegnazione[],
): boolean {
  return getCameraOccupazione(camera, assegnazioni) > getCameraCapienza(camera);
}
