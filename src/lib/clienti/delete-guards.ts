import type { TypedSupabaseClient } from "@/lib/supabase/browser";

export type ClienteDeleteBlocker =
  | { kind: "preventivo"; label: string }
  | { kind: "iscrizione_tour"; label: string };

export async function getClienteDeleteBlockers(
  supabase: TypedSupabaseClient,
  clienteId: string,
  organizationId: string,
): Promise<ClienteDeleteBlocker[]> {
  const blockers: ClienteDeleteBlocker[] = [];

  const { data: preventivi, error: preventiviError } = await supabase
    .from("preventivi")
    .select("numero")
    .eq("cliente_id", clienteId)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (preventiviError) {
    throw new Error(`Verifica preventivi collegati: ${preventiviError.message}`);
  }

  for (const preventivo of preventivi ?? []) {
    blockers.push({
      kind: "preventivo",
      label: preventivo.numero,
    });
  }

  const { data: participants, error: participantsError } = await supabase
    .from("tour_participants")
    .select("id, tour_id")
    .eq("cliente_id", clienteId)
    .eq("organization_id", organizationId)
    .limit(10);

  if (participantsError) {
    throw new Error(`Verifica iscrizioni tour collegati: ${participantsError.message}`);
  }

  const tourIds = [
    ...new Set((participants ?? []).map((row) => row.tour_id).filter(Boolean)),
  ];

  if (tourIds.length > 0) {
    const { data: tours, error: toursError } = await supabase
      .from("tours")
      .select("id, nome")
      .in("id", tourIds);

    if (toursError) {
      throw new Error(`Verifica tour collegati: ${toursError.message}`);
    }

    const tourNames = new Map(
      (tours ?? []).map((tour) => [tour.id, tour.nome.trim() || "Tour collegato"]),
    );

    for (const participant of participants ?? []) {
      blockers.push({
        kind: "iscrizione_tour",
        label: tourNames.get(participant.tour_id) ?? "Tour collegato",
      });
    }
  }

  return blockers;
}

export function formatClienteDeleteBlockedMessage(
  blockers: ClienteDeleteBlocker[],
): string {
  const preventivi = blockers.filter((item) => item.kind === "preventivo");
  const iscrizioni = blockers.filter((item) => item.kind === "iscrizione_tour");

  const parts: string[] = [];

  if (preventivi.length > 0) {
    const labels = preventivi.map((item) => item.label).join(", ");
    parts.push(
      `${preventivi.length} preventiv${preventivi.length === 1 ? "o" : "i"} (${labels})`,
    );
  }

  if (iscrizioni.length > 0) {
    const labels = iscrizioni.map((item) => item.label).join(", ");
    parts.push(
      `${iscrizioni.length} iscrizion${iscrizioni.length === 1 ? "e" : "i"} tour (${labels})`,
    );
  }

  return (
    `Impossibile eliminare il cliente: risultano collegati ${parts.join(" e ")}. ` +
    "Elimina prima queste entità dalla rispettiva sezione."
  );
}

export function mapClienteDeleteForeignKeyError(message: string): string | null {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("foreign key") ||
    normalized.includes("violates foreign key constraint") ||
    normalized.includes("23503")
  ) {
    if (normalized.includes("preventivi")) {
      return (
        "Impossibile eliminare il cliente: esistono preventivi collegati. " +
        "Elimina o riassegna i preventivi prima di procedere."
      );
    }

    if (normalized.includes("tour_participants")) {
      return (
        "Impossibile eliminare il cliente: risulta iscritto a uno o più tour. " +
        "Rimuovi le iscrizioni dalla scheda tour prima di procedere."
      );
    }

    return (
      "Impossibile eliminare il cliente: esistono record collegati nel gestionale. " +
      "Elimina prima preventivi, iscrizioni tour e altre dipendenze."
    );
  }

  return null;
}
