import { mapClienteDocumentiToDocumentiViaggiatore } from "@/mappers/documenti-viaggiatore.mapper";
import { getDocumentiByClienteId } from "@/services/cliente-documento.service";
import type { DocumentiViaggiatore } from "@/types/documenti-viaggiatore";

export async function getDocumentiViaggiatoreByClienteId(
  clienteId: string,
): Promise<DocumentiViaggiatore> {
  const data = await getDocumentiByClienteId(clienteId);
  return mapClienteDocumentiToDocumentiViaggiatore(data.documenti);
}
