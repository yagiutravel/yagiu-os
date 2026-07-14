import {
  getDashboardData,
  searchDashboard,
} from "@/services/dashboard.service";
import type { DashboardSearchResult } from "@/types/dashboard";
import type { AiTool, AiToolInput, AiToolResult } from "../models/tool";

export type SearchDashboardData = {
  query: string;
  kpi: {
    clienti: number;
    tour: number;
    partecipanti: number;
    postiDisponibili: number;
    percentualeOccupazioneMedia: number;
  };
  tourInPartenza: Array<{
    id: string;
    label: string;
    snippet: string;
  }>;
  searchResults: DashboardSearchResult[];
};

export class SearchDashboardTool implements AiTool<SearchDashboardData> {
  readonly name = "searchDashboard" as const;
  readonly description =
    "Recupera metriche operative e ricerca dashboard tramite dashboard.service.";

  async execute(input: AiToolInput): Promise<AiToolResult<SearchDashboardData>> {
    const dashboard = await getDashboardData();
    const searchResults = input.query.trim()
      ? await searchDashboard(input.query)
      : [];

    const tourInPartenza = dashboard.tourInPartenza.map((tour) => ({
      id: tour.tourId,
      label: tour.nomeTour,
      snippet: `${tour.destinazione} · ${tour.giorniMancanti} giorni alla partenza`,
    }));

    return {
      tool: this.name,
      success: true,
      data: {
        query: input.query,
        kpi: {
          clienti: dashboard.kpi.clienti,
          tour: dashboard.kpi.tour,
          partecipanti: dashboard.kpi.partecipanti,
          postiDisponibili: dashboard.kpi.postiDisponibili,
          percentualeOccupazioneMedia: dashboard.kpi.percentualeOccupazioneMedia,
        },
        tourInPartenza,
        searchResults,
      },
      summary: `Dashboard: ${dashboard.kpi.postiDisponibili} posti disponibili, ${dashboard.kpi.tour} tour attivi`,
    };
  }
}
