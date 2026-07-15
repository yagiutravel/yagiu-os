import type {
  ClienteQuestionario,
  ClienteQuestionarioView,
} from "@/types/cliente-questionario";
import type { ClienteQuestionarioRow } from "@/types/database";

export function mapQuestionarioToView(
  questionario: ClienteQuestionario,
): ClienteQuestionarioView {
  return { ...questionario };
}

export function mapClienteQuestionarioRowToQuestionario(
  row: ClienteQuestionarioRow,
): ClienteQuestionario {
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
