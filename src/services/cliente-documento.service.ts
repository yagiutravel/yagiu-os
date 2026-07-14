import { mapClienteDocumentiData } from "@/mappers/cliente-documento.mapper";
import {
  listDocumentiByClienteIdMock,
  seedClienteDocumentiMock,
} from "@/mock/cliente-documenti";
import type { ClienteDocumentiData } from "@/types/cliente-documento";

export async function getDocumentiByClienteId(
  clienteId: string,
): Promise<ClienteDocumentiData> {
  seedClienteDocumentiMock(clienteId);
  const documenti = listDocumentiByClienteIdMock(clienteId);
  return mapClienteDocumentiData(documenti);
}
