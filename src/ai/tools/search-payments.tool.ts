import { getDashboardData } from "@/services/dashboard.service";
import { getPagamentiByTourId } from "@/services/pagamento.service";
import { getActiveTours } from "@/services/tour.service";
import type { AiTool, AiToolInput, AiToolResult } from "../models/tool";

export type SearchPaymentsData = {
  query: string;
  dashboardSummary: {
    accontiMancanti: number;
    saldiMancanti: number;
    importoTotaleDaIncassare: number;
  };
  tourPayments: Array<{
    id: string;
    label: string;
    snippet: string;
    tourId: string;
    totaleIncassato: number;
    totaleAtteso: number;
  }>;
};

export class SearchPaymentsTool implements AiTool<SearchPaymentsData> {
  readonly name = "searchPayments" as const;
  readonly description =
    "Recupera pagamenti e saldi tramite dashboard.service e pagamento.service.";

  async execute(input: AiToolInput): Promise<AiToolResult<SearchPaymentsData>> {
    const dashboard = await getDashboardData();
    const activeTours = await getActiveTours();

    const tourPayments = await Promise.all(
      activeTours.slice(0, 4).map(async (tour) => {
        const data = await getPagamentiByTourId(tour.id);
        const percentuale =
          data.riepilogo.totaleTour > 0
            ? Math.round(
                (data.riepilogo.incassato / data.riepilogo.totaleTour) * 100,
              )
            : 0;
        return {
          id: tour.id,
          label: tour.nomeTour,
          snippet: `${data.partecipanti.length} partecipanti · ${percentuale}% incassato`,
          tourId: tour.id,
          totaleIncassato: data.riepilogo.incassato,
          totaleAtteso: data.riepilogo.totaleTour,
        };
      }),
    );

    return {
      tool: this.name,
      success: true,
      data: {
        query: input.query,
        dashboardSummary: dashboard.pagamenti,
        tourPayments,
      },
      summary: `Pagamenti recuperati: ${dashboard.pagamenti.saldiMancanti} saldi mancanti, ${dashboard.pagamenti.accontiMancanti} acconti mancanti`,
    };
  }
}
