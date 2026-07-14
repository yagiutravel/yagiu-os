import { getClienti } from "@/services/clienti.service";
import type { Cliente } from "@/types/cliente";
import type { AiTool, AiToolInput, AiToolResult } from "../models/tool";

export type SearchClientsData = {
  query: string;
  total: number;
  items: Array<{
    id: string;
    label: string;
    snippet: string;
    cliente: Cliente;
  }>;
};

export class SearchClientsTool implements AiTool<SearchClientsData> {
  readonly name = "searchClients" as const;
  readonly description = "Cerca clienti nel CRM tramite il service clienti.";

  async execute(input: AiToolInput): Promise<AiToolResult<SearchClientsData>> {
    const query = input.query.trim().toLowerCase();
    const clienti = await getClienti();

    const filtered = clienti.filter((cliente) => {
      if (!query) return true;
      return (
        cliente.nome.toLowerCase().includes(query) ||
        cliente.email.toLowerCase().includes(query) ||
        (cliente.telefono?.toLowerCase().includes(query) ?? false)
      );
    });

    const items = filtered.map((cliente) => ({
      id: cliente.id,
      label: cliente.nome,
      snippet: `${cliente.email} · ${cliente.telefono ?? "—"}`,
      cliente,
    }));

    return {
      tool: this.name,
      success: true,
      data: { query: input.query, total: items.length, items },
      summary: `${items.length} clienti trovati tramite clienti.service`,
    };
  }
}
