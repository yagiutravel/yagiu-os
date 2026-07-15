import { mapClienteTimelineToData } from "@/mappers/cliente-timeline.mapper";
import { fetchClienteTimelineEventi } from "@/services/cliente-timeline-event.service";
import type { ClienteTimelineData } from "@/types/cliente-timeline";

export class ClienteTimelineServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClienteTimelineServiceError";
  }
}

export async function getClienteTimeline(
  clienteId: string,
): Promise<ClienteTimelineData> {
  const eventi = await fetchClienteTimelineEventi(clienteId);
  return mapClienteTimelineToData(eventi);
}
