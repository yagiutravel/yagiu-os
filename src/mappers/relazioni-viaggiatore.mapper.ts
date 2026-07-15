import {
  EMPTY_RELAZIONE_PERSONA,
  EMPTY_RELAZIONI,
} from "@/models/relazioni-viaggiatore";
import type { Cliente } from "@/types/cliente";
import type { TourStaffRow, RoomAssignmentRow } from "@/types/database";
import type { RelazionePersona, RelazioniViaggiatore } from "@/types/relazioni-viaggiatore";
import type { PartecipazioneTour } from "@/types/tour-partecipazione";

type MapRelazioniViaggiatoreInput = {
  clienteId: string;
  tourIds: Set<string>;
  staff: TourStaffRow[];
  participants: PartecipazioneTour[];
  assignments: RoomAssignmentRow[];
  roomAssignments: RoomAssignmentRow[];
  clienti: Cliente[];
};

function pickStaffRelazione(
  staff: TourStaffRow[],
  tourIds: Set<string>,
  ruolo: TourStaffRow["ruolo"],
): RelazionePersona {
  const counts = new Map<string, { id: string; count: number }>();

  for (const row of staff) {
    if (!tourIds.has(row.tour_id) || row.ruolo !== ruolo) continue;

    const current = counts.get(row.nome) ?? { id: row.id, count: 0 };
    current.count += 1;
    counts.set(row.nome, current);
  }

  const best = [...counts.entries()].sort((a, b) => b[1].count - a[1].count)[0];
  if (!best) return EMPTY_RELAZIONE_PERSONA;

  return {
    id: best[1].id,
    nome: best[0],
    viaggiInsieme: best[1].count,
  };
}

function getClienteNome(clienti: Cliente[], clienteId: string): string {
  const cliente = clienti.find((item) => item.id === clienteId);
  return cliente?.nome ?? "—";
}

function pickCompagnoCamera(
  clienteId: string,
  participants: PartecipazioneTour[],
  assignments: RoomAssignmentRow[],
  roomAssignments: RoomAssignmentRow[],
  clienti: Cliente[],
): RelazionePersona {
  const participantIds = new Set(
    participants
      .filter((item) => item.clienteId === clienteId)
      .map((item) => item.id),
  );

  const roomIds = new Set(
    assignments
      .filter((item) => participantIds.has(item.participant_id))
      .map((item) => item.room_id),
  );

  const counts = new Map<string, { id: string; count: number }>();

  for (const assignment of roomAssignments) {
    if (!roomIds.has(assignment.room_id)) continue;

    const participant = participants.find(
      (item) => item.id === assignment.participant_id,
    );
    if (!participant || participant.clienteId === clienteId) continue;

    const nome = getClienteNome(clienti, participant.clienteId);
    const current = counts.get(nome) ?? { id: participant.clienteId, count: 0 };
    current.count += 1;
    counts.set(nome, current);
  }

  const best = [...counts.entries()].sort((a, b) => b[1].count - a[1].count)[0];
  if (!best) return EMPTY_RELAZIONE_PERSONA;

  return {
    id: best[1].id,
    nome: best[0],
    viaggiInsieme: best[1].count,
  };
}

function mapHaViaggiatoCon(
  clienteId: string,
  tourIds: Set<string>,
  participants: PartecipazioneTour[],
  clienti: Cliente[],
): RelazionePersona[] {
  const counts = new Map<string, { id: string; count: number }>();

  for (const tourId of tourIds) {
    const tourParticipants = participants.filter((item) => item.tourId === tourId);

    for (const participant of tourParticipants) {
      if (participant.clienteId === clienteId) continue;

      const nome = getClienteNome(clienti, participant.clienteId);
      const current = counts.get(nome) ?? { id: participant.clienteId, count: 0 };
      current.count += 1;
      counts.set(nome, current);
    }
  }

  return [...counts.entries()]
    .map(([nome, value]) => ({
      id: value.id,
      nome,
      viaggiInsieme: value.count,
    }))
    .sort((a, b) => b.viaggiInsieme - a.viaggiInsieme || a.nome.localeCompare(b.nome, "it"));
}

export function mapRelazioniViaggiatoreData(
  input: MapRelazioniViaggiatoreInput,
): RelazioniViaggiatore {
  if (input.tourIds.size === 0) {
    return EMPTY_RELAZIONI;
  }

  return {
    tourLeader: pickStaffRelazione(input.staff, input.tourIds, "tour_leader"),
    guidaLocale: pickStaffRelazione(input.staff, input.tourIds, "guida_locale"),
    driver: pickStaffRelazione(input.staff, input.tourIds, "operatore"),
    compagnoCamera: pickCompagnoCamera(
      input.clienteId,
      input.participants,
      input.assignments,
      input.roomAssignments,
      input.clienti,
    ),
    haViaggiatoCon: mapHaViaggiatoCon(
      input.clienteId,
      input.tourIds,
      input.participants,
      input.clienti,
    ),
  };
}
