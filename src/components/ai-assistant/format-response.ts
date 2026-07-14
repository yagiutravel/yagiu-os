import type { AiOrchestrationResult } from "@/ai";
import type { SearchClientsData } from "@/ai/tools/search-clients.tool";
import type { SearchDashboardData } from "@/ai/tools/search-dashboard.tool";
import type { SearchDocumentsData } from "@/ai/tools/search-documents.tool";
import type { SearchPaymentsData } from "@/ai/tools/search-payments.tool";
import type { SearchToursData } from "@/ai/tools/search-tours.tool";

export function formatAiResponse(result: AiOrchestrationResult): string {
  if (!result.toolResult.success) {
    return "Non sono riuscito a elaborare la richiesta. Riprova con una domanda più specifica.";
  }

  const { tool, data, summary } = result.toolResult;

  switch (tool) {
    case "searchPayments": {
      const payload = data as SearchPaymentsData;
      const lines = [
        `**Pagamenti in sospeso**`,
        `- Acconti mancanti: ${payload.dashboardSummary.accontiMancanti}`,
        `- Saldi mancanti: ${payload.dashboardSummary.saldiMancanti}`,
        `- Importo totale da incassare: € ${payload.dashboardSummary.importoTotaleDaIncassare.toLocaleString("it-IT")}`,
      ];

      if (payload.tourPayments.length > 0) {
        lines.push("", "**Dettaglio per tour:**");
        for (const tour of payload.tourPayments.slice(0, 4)) {
          lines.push(`- ${tour.label}: € ${tour.totaleIncassato.toLocaleString("it-IT")} / € ${tour.totaleAtteso.toLocaleString("it-IT")}`);
        }
      }

      return lines.join("\n");
    }

    case "searchDocuments": {
      const payload = data as SearchDocumentsData;
      const { dashboardSummary: doc } = payload;
      const lines = [
        `**Documenti da completare**`,
        `- Passaporti mancanti: ${doc.passaportiMancanti}`,
        `- Questionari mancanti: ${doc.questionariMancanti}`,
        `- Assicurazioni mancanti: ${doc.assicurazioniMancanti}`,
        `- Liberatorie mancanti: ${doc.liberatorieMancanti}`,
      ];

      if (payload.items.length > 0) {
        lines.push("", "**Esempi rilevati:**");
        for (const item of payload.items.slice(0, 5)) {
          lines.push(`- ${item.label} (${item.stato})`);
        }
      }

      return lines.join("\n");
    }

    case "searchDashboard": {
      const payload = data as SearchDashboardData;
      const lines = [
        `**Panoramica operativa**`,
        `- Clienti: ${payload.kpi.clienti}`,
        `- Tour attivi: ${payload.kpi.tour}`,
        `- Partecipanti: ${payload.kpi.partecipanti}`,
        `- **Posti disponibili: ${payload.kpi.postiDisponibili}**`,
        `- Occupazione media: ${payload.kpi.percentualeOccupazioneMedia}%`,
      ];

      if (payload.tourInPartenza.length > 0) {
        lines.push("", "**Tour in partenza:**");
        for (const tour of payload.tourInPartenza.slice(0, 4)) {
          lines.push(`- ${tour.label} — ${tour.snippet}`);
        }
      }

      return lines.join("\n");
    }

    case "searchTours": {
      const payload = data as SearchToursData;
      if (payload.items.length === 0) {
        return "Nessun tour corrisponde alla richiesta.";
      }

      const lines = [`**Tour trovati (${payload.total}):**`];
      for (const tour of payload.items.slice(0, 5)) {
        lines.push(
          `- **${tour.label}** — ${tour.snippet} · ${tour.partecipanti} partecipanti · partenza tra ${tour.giorniAllaPartenza} giorni`,
        );
      }
      return lines.join("\n");
    }

    case "searchClients": {
      const payload = data as SearchClientsData;
      if (payload.items.length === 0) {
        return "Nessun cliente corrisponde alla ricerca.";
      }

      const lines = [`**Clienti trovati (${payload.total}):**`];
      for (const item of payload.items.slice(0, 6)) {
        lines.push(`- ${item.label} — ${item.snippet}`);
      }
      return lines.join("\n");
    }

    default:
      return summary;
  }
}
