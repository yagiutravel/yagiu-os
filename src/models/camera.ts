import type {
  Camera,
  CameraAssegnazione,
  CameraForm,
  CameraView,
  CreateCameraInput,
  StatoOccupazioneCamera,
  TipologiaCamera,
} from "@/types/camera";

export const TIPOLOGIA_CAMERA_OPTIONS: {
  value: TipologiaCamera;
  label: string;
}[] = [
  { value: "Singola", label: "Singola" },
  { value: "Doppia", label: "Doppia" },
  { value: "Tripla", label: "Tripla" },
  { value: "Quadrupla", label: "Quadrupla" },
];

export const CAPIENZA_BY_TIPOLOGIA: Record<TipologiaCamera, number> = {
  Singola: 1,
  Doppia: 2,
  Tripla: 3,
  Quadrupla: 4,
};

export const EMPTY_CAMERA_FORM: CameraForm = {
  numero: "",
  tipologia: "Doppia",
  note: "",
};

export function getCapienzaFromTipologia(tipologia: TipologiaCamera): number {
  return CAPIENZA_BY_TIPOLOGIA[tipologia];
}

export function getStatoOccupazione(
  occupazione: number,
  capienza: number,
): StatoOccupazioneCamera {
  if (occupazione === 0) return "Vuota";
  if (occupazione >= capienza) return "Completa";
  return "Parziale";
}

export function createCameraId(): string {
  return `cam-${crypto.randomUUID()}`;
}

export function createAssegnazioneId(): string {
  return `cam-asg-${crypto.randomUUID()}`;
}

export function createCamera(input: CreateCameraInput): Camera {
  const now = new Date().toISOString();

  return {
    id: createCameraId(),
    tourId: input.tourId,
    numero: input.numero.trim(),
    tipologia: input.tipologia,
    note: input.note?.trim() ?? "",
    creatoIl: now,
    aggiornatoIl: now,
  };
}

export function createCameraAssegnazione(
  cameraId: string,
  partecipazioneId: string,
): CameraAssegnazione {
  return {
    id: createAssegnazioneId(),
    cameraId,
    partecipazioneId,
    creatoIl: new Date().toISOString(),
  };
}

export function cameraToForm(camera: Camera): CameraForm {
  return {
    numero: camera.numero,
    tipologia: camera.tipologia,
    note: camera.note,
  };
}

export function formToCreateInput(
  tourId: string,
  form: CameraForm,
): CreateCameraInput {
  return {
    tourId,
    numero: form.numero,
    tipologia: form.tipologia,
    note: form.note,
  };
}

export function enrichCameraView(
  camera: Camera,
  partecipanti: CameraView["partecipanti"],
): CameraView {
  const capienza = getCapienzaFromTipologia(camera.tipologia);
  const occupazione = partecipanti.length;

  return {
    ...camera,
    capienza,
    occupazione,
    statoOccupazione: getStatoOccupazione(occupazione, capienza),
    partecipanti,
  };
}
