/** Questionario viaggiatore — pronto per tabella Supabase `cliente_questionari`. */
export type ClienteQuestionario = {
  id: string;
  clienteId: string;
  allergie: string;
  intolleranze: string;
  farmaci: string;
  contattoEmergenza: string;
  numeroEmergenza: string;
  tagliaMaglietta: string;
  tagliaFelpa: string;
  cameraPreferita: string;
  compagnoRichiesto: string;
  noteAlimentari: string;
  vegetariano: boolean;
  vegano: boolean;
  celiaco: boolean;
  fumatore: boolean;
  creatoIl: string;
  aggiornatoIl: string;
};

export type ClienteQuestionarioView = ClienteQuestionario;

/** Shape prevista per Supabase — non collegata ancora. */
export type ClienteQuestionarioRow = {
  id: string;
  cliente_id: string;
  allergie: string;
  intolleranze: string;
  farmaci: string;
  contatto_emergenza: string;
  numero_emergenza: string;
  taglia_maglietta: string;
  taglia_felpa: string;
  camera_preferita: string;
  compagno_richiesto: string;
  note_alimentari: string;
  vegetariano: boolean;
  vegano: boolean;
  celiaco: boolean;
  fumatore: boolean;
  creato_il: string;
  aggiornato_il: string;
};
