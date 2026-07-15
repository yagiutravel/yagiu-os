import type { ClienteNoteStaffRow } from "@/types/database";
import type { NotaStaff } from "@/types/note-staff";

export function mapClienteNoteStaffRowToNotaStaff(
  row: ClienteNoteStaffRow,
): NotaStaff {
  return {
    id: row.id,
    autore: row.autore,
    data: row.data,
    contenuto: row.contenuto,
  };
}
