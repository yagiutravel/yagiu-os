import type {
  CreateTourInput,
  Tour,
  TourForm,
  TourFormErrors,
  UpdateTourInput,
} from "@/types/tour";

export const EMPTY_TOUR_FORM: TourForm = {
  nomeTour: "",
  destinazione: "",
  dataPartenza: "",
  dataRitorno: "",
  stato: "In vendita",
  capienzaMassima: "",
  tourLeader: "",
  prezzo: "",
  descrizione: "",
};

export function tourToForm(tour: Tour): TourForm {
  return {
    nomeTour: tour.nomeTour,
    destinazione: tour.destinazione,
    dataPartenza: tour.dataPartenza,
    dataRitorno: tour.dataRitorno,
    stato: tour.stato === "Archiviato" ? "In vendita" : tour.stato,
    capienzaMassima: String(tour.capienzaMassima),
    tourLeader: tour.tourLeader,
    prezzo: tour.prezzo,
    descrizione: tour.descrizione,
  };
}

export function validateTourForm(form: TourForm): TourFormErrors {
  const errors: TourFormErrors = {};

  if (!form.nomeTour.trim()) {
    errors.nomeTour = "Il nome del tour è obbligatorio.";
  }

  if (!form.destinazione.trim()) {
    errors.destinazione = "La destinazione è obbligatoria.";
  }

  if (!form.dataPartenza) {
    errors.dataPartenza = "La data di partenza è obbligatoria.";
  }

  if (!form.dataRitorno) {
    errors.dataRitorno = "La data di ritorno è obbligatoria.";
  }

  if (form.dataPartenza && form.dataRitorno) {
    const partenza = new Date(`${form.dataPartenza}T00:00:00`);
    const ritorno = new Date(`${form.dataRitorno}T00:00:00`);
    if (
      !Number.isNaN(partenza.getTime()) &&
      !Number.isNaN(ritorno.getTime()) &&
      ritorno < partenza
    ) {
      errors.dataRitorno = "La data di ritorno deve essere successiva alla partenza.";
    }
  }

  const capienza = Number.parseInt(form.capienzaMassima, 10);
  if (!form.capienzaMassima.trim() || Number.isNaN(capienza) || capienza < 1) {
    errors.capienzaMassima = "Inserisci una capienza valida (minimo 1).";
  }

  if (!form.tourLeader.trim()) {
    errors.tourLeader = "Il tour leader è obbligatorio.";
  }

  if (!form.prezzo.trim()) {
    errors.prezzo = "Il prezzo è obbligatorio.";
  }

  return errors;
}

export function hasTourFormErrors(errors: TourFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function formToCreateInput(form: TourForm): CreateTourInput {
  return {
    nomeTour: form.nomeTour.trim(),
    destinazione: form.destinazione.trim(),
    dataPartenza: form.dataPartenza,
    dataRitorno: form.dataRitorno,
    stato: form.stato,
    capienzaMassima: Number.parseInt(form.capienzaMassima, 10),
    tourLeader: form.tourLeader.trim(),
    prezzo: form.prezzo.trim(),
    descrizione: form.descrizione.trim(),
  };
}

export function formToUpdateInput(form: TourForm): UpdateTourInput {
  return formToCreateInput(form);
}
