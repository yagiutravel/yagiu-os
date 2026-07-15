import { mapQuestionarioToPreferenzeViaggiatore } from "@/mappers/preferenze-viaggiatore.mapper";
import { getQuestionarioByClienteId } from "@/services/cliente-questionario.service";
import type { PreferenzeViaggiatore } from "@/types/preferenze-viaggiatore";

export async function getPreferenzeByClienteId(
  clienteId: string,
): Promise<PreferenzeViaggiatore> {
  const questionario = await getQuestionarioByClienteId(clienteId);
  return mapQuestionarioToPreferenzeViaggiatore(questionario);
}
