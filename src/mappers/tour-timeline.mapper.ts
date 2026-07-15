import type { TourTimelineEventRow } from "@/types/database";
import type { TimelineEvento, TimelineEventoTipo } from "@/types/timeline-viaggiatore";

export function mapTourTimelineRowToEvento(row: TourTimelineEventRow): TimelineEvento {
  return {
    id: row.id,
    tipo: row.tipo as TimelineEventoTipo,
    titolo: row.titolo,
    descrizione: row.descrizione,
    data: row.created_at,
  };
}
