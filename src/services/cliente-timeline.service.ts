import { mapClienteTimelineToData } from "@/mappers/cliente-timeline.mapper";
import { fetchClienteTimelineEventi } from "@/services/cliente-timeline-event.service";
import {
  listEventiByClienteIdMock,
  seedClienteTimelineMock,
} from "@/mock/cliente-timeline";
import type { ClienteTimelineData } from "@/types/cliente-timeline";

export class ClienteTimelineServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClienteTimelineServiceError";
  }
}

export async function getClienteTimeline(
  clienteId: string,
  nomeCliente: string,
): Promise<ClienteTimelineData> {
  const eventi = await fetchClienteTimelineEventi(clienteId);
  if (eventi.length > 0) {
    return mapClienteTimelineToData(eventi);
  }

  seedClienteTimelineMock(clienteId, nomeCliente);
  return mapClienteTimelineToData(listEventiByClienteIdMock(clienteId, nomeCliente));
}
