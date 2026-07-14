export type ComunicazioniSezioneId = "centro" | "template-email";

export type ComunicazioniSezione = {
  id: ComunicazioniSezioneId;
  label: string;
};

export const COMUNICAZIONI_SEZIONI: ComunicazioniSezione[] = [
  { id: "centro", label: "Centro comunicazioni" },
  { id: "template-email", label: "Template email" },
];

export const COMUNICAZIONI_SEZIONE_DEFAULT: ComunicazioniSezioneId = "centro";
