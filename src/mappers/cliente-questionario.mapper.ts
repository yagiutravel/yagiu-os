import type {
  ClienteQuestionario,
  ClienteQuestionarioView,
} from "@/types/cliente-questionario";

export function mapQuestionarioToView(
  questionario: ClienteQuestionario,
): ClienteQuestionarioView {
  return { ...questionario };
}

/** Mapper Supabase — pronto per integrazione futura. */
export function mapClienteQuestionarioRowToQuestionario(row: {
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
}): ClienteQuestionario {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    allergie: row.allergie,
    intolleranze: row.intolleranze,
    farmaci: row.farmaci,
    contattoEmergenza: row.contatto_emergenza,
    numeroEmergenza: row.numero_emergenza,
    tagliaMaglietta: row.taglia_maglietta,
    tagliaFelpa: row.taglia_felpa,
    cameraPreferita: row.camera_preferita,
    compagnoRichiesto: row.compagno_richiesto,
    noteAlimentari: row.note_alimentari,
    vegetariano: row.vegetariano,
    vegano: row.vegano,
    celiaco: row.celiaco,
    fumatore: row.fumatore,
    creatoIl: row.creato_il,
    aggiornatoIl: row.aggiornato_il,
  };
}
