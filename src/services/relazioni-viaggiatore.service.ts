import { getOrganizationId } from "@/config/organization";
import { getSupabaseClient } from "@/config/supabase";
import { mapRelazioniViaggiatoreData } from "@/mappers/relazioni-viaggiatore.mapper";
import { mapParticipantRowToPartecipazione } from "@/mappers/tour-participant.mapper";
import { EMPTY_RELAZIONI } from "@/models/relazioni-viaggiatore";
import { getClienti } from "@/services/clienti.service";
import { getTourByClienteId } from "@/services/tour-partecipazione.service";
import type {
  RoomAssignmentRow,
  TourParticipantRow,
  TourStaffRow,
} from "@/types/database";
import type { RelazioniViaggiatore } from "@/types/relazioni-viaggiatore";

export class RelazioniViaggiatoreServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RelazioniViaggiatoreServiceError";
  }
}

const STAFF_TABLE = "tour_staff";
const PARTICIPANTS_TABLE = "tour_participants";
const ASSIGNMENTS_TABLE = "room_assignments";

function handleSupabaseError(
  operation: string,
  error: { message: string; code?: string },
): never {
  throw new RelazioniViaggiatoreServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getRelazioniByClienteId(
  clienteId: string,
): Promise<RelazioniViaggiatore> {
  const tours = await getTourByClienteId(clienteId);
  if (tours.length === 0) {
    return EMPTY_RELAZIONI;
  }

  const tourIds = [...new Set(tours.map((tour) => tour.tourId))];
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const [staffResult, participantsResult, clienti] = await Promise.all([
    supabase
      .from(STAFF_TABLE)
      .select("*")
      .eq("organization_id", organizationId)
      .in("tour_id", tourIds),
    supabase
      .from(PARTICIPANTS_TABLE)
      .select("*")
      .eq("organization_id", organizationId)
      .in("tour_id", tourIds),
    getClienti(),
  ]);

  if (staffResult.error) {
    handleSupabaseError("getRelazioniByClienteIdStaff", staffResult.error);
  }
  if (participantsResult.error) {
    handleSupabaseError(
      "getRelazioniByClienteIdParticipants",
      participantsResult.error,
    );
  }

  const staff = (staffResult.data ?? []) as TourStaffRow[];
  const participants = ((participantsResult.data ?? []) as TourParticipantRow[]).map(
    mapParticipantRowToPartecipazione,
  );
  const myParticipantIds = participants
    .filter((item) => item.clienteId === clienteId)
    .map((item) => item.id);

  let assignments: RoomAssignmentRow[] = [];
  let roomAssignments: RoomAssignmentRow[] = [];

  if (myParticipantIds.length > 0) {
    const { data: assignmentData, error: assignmentError } = await supabase
      .from(ASSIGNMENTS_TABLE)
      .select("*")
      .eq("organization_id", organizationId)
      .in("participant_id", myParticipantIds);

    if (assignmentError) {
      handleSupabaseError(
        "getRelazioniByClienteIdAssignments",
        assignmentError,
      );
    }

    assignments = (assignmentData ?? []) as RoomAssignmentRow[];
    const roomIds = [...new Set(assignments.map((item) => item.room_id))];

    if (roomIds.length > 0) {
      const { data: roomAssignmentData, error: roomAssignmentError } =
        await supabase
          .from(ASSIGNMENTS_TABLE)
          .select("*")
          .eq("organization_id", organizationId)
          .in("room_id", roomIds);

      if (roomAssignmentError) {
        handleSupabaseError(
          "getRelazioniByClienteIdRoomAssignments",
          roomAssignmentError,
        );
      }

      roomAssignments = (roomAssignmentData ?? []) as RoomAssignmentRow[];
    }
  }

  return mapRelazioniViaggiatoreData({
    clienteId,
    tourIds: new Set(tourIds),
    staff,
    participants,
    assignments,
    roomAssignments,
    clienti,
  });
}
