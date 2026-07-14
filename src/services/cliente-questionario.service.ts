import { mapQuestionarioToView } from "@/mappers/cliente-questionario.mapper";
import {
  findQuestionarioByClienteIdMock,
  seedClienteQuestionarioMock,
} from "@/mock/cliente-questionari";
import type { ClienteQuestionarioView } from "@/types/cliente-questionario";

export class ClienteQuestionarioServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClienteQuestionarioServiceError";
  }
}

export async function getQuestionarioByClienteId(
  clienteId: string,
): Promise<ClienteQuestionarioView | null> {
  seedClienteQuestionarioMock(clienteId);
  const questionario = findQuestionarioByClienteIdMock(clienteId);
  if (!questionario) return null;
  return mapQuestionarioToView(questionario);
}
