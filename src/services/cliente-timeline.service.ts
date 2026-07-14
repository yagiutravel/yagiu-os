import { mapClienteTimelineToData } from "@/mappers/cliente-timeline.mapper";
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
  seedClienteTimelineMock(clienteId, nomeCliente);
  const eventi = listEventiByClienteIdMock(clienteId, nomeCliente);
  return mapClienteTimelineToData(eventi);
}
