import { getClienti } from "@/services/clienti.service";
import { getDocumentiByClienteId } from "@/services/cliente-documento.service";
import { getDashboardData } from "@/services/dashboard.service";
import type { AiTool, AiToolInput, AiToolResult } from "../models/tool";

export type SearchDocumentsData = {
  query: string;
  dashboardSummary: {
    passaportiMancanti: number;
    questionariMancanti: number;
    assicurazioniMancanti: number;
    liberatorieMancanti: number;
  };
  items: Array<{
    id: string;
    label: string;
    snippet: string;
    clienteId: string;
    documento: string;
    stato: string;
  }>;
};

export class SearchDocumentsTool implements AiTool<SearchDocumentsData> {
  readonly name = "searchDocuments" as const;
  readonly description =
    "Recupera documenti mancanti tramite cliente-documento.service e dashboard.service.";

  async execute(input: AiToolInput): Promise<AiToolResult<SearchDocumentsData>> {
    const dashboard = await getDashboardData();
    const clienti = await getClienti();
    const sampleClienti = clienti.slice(0, 6);

    const documentSets = await Promise.all(
      sampleClienti.map(async (cliente) => {
        const data = await getDocumentiByClienteId(cliente.id);
        return data.documenti
          .filter((doc) => doc.stato !== "valido")
          .map((doc) => ({
            id: doc.id,
            label: `${cliente.nome} — ${doc.tipo}`,
            snippet: `${doc.tipo} · ${doc.stato}`,
            clienteId: cliente.id,
            documento: doc.tipo,
            stato: doc.stato,
          }));
      }),
    );

    const items = documentSets.flat();

    return {
      tool: this.name,
      success: true,
      data: {
        query: input.query,
        dashboardSummary: dashboard.documenti,
        items,
      },
      summary: `${items.length} documenti da completare su ${sampleClienti.length} clienti analizzati`,
    };
  }
}
