/** Questionario viaggiatore — tabella Supabase `cliente_questionari`. */
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
