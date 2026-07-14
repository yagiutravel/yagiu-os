import { calcolaGiorniMancanti } from "@/models/dashboard";
import { getActiveTours } from "@/services/tour.service";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import type { Tour } from "@/types/tour";
import type { AiTool, AiToolInput, AiToolResult } from "../models/tool";

export type SearchToursData = {
  query: string;
  total: number;
  items: Array<{
    id: string;
    label: string;
    snippet: string;
    tour: Tour;
    partecipanti: number;
    giorniAllaPartenza: number;
  }>;
};

function isNextWeek(departureDate: string, now = new Date()): boolean {
  const days = calcolaGiorniMancanti(departureDate, now);
  return days >= 0 && days <= 7;
}

export class SearchToursTool implements AiTool<SearchToursData> {
  readonly name = "searchTours" as const;
  readonly description =
    "Cerca tour e partenze imminenti tramite dati tour e partecipazioni.";

  async execute(input: AiToolInput): Promise<AiToolResult<SearchToursData>> {
    const query = input.query.trim().toLowerCase();
    const wantsNextWeek = /settimana|parte|partenz/.test(query);
    const tours = (await getActiveTours()).filter(
      (tour) => tour.stato !== "Terminato",
    );

    const candidates = wantsNextWeek
      ? tours.filter((tour) => isNextWeek(tour.dataPartenza))
      : tours.filter((tour) => {
          if (!query) return true;
          return (
            tour.nomeTour.toLowerCase().includes(query) ||
            tour.destinazione.toLowerCase().includes(query)
          );
        });

    const items = await Promise.all(
      candidates.map(async (tour) => {
        const partecipazioni = await getPartecipazioniByTourId(tour.id);
        return {
          id: tour.id,
          label: tour.nomeTour,
          snippet: `${tour.destinazione} · partenza ${tour.dataPartenza}`,
          tour,
          partecipanti: partecipazioni.length,
          giorniAllaPartenza: calcolaGiorniMancanti(tour.dataPartenza),
        };
      }),
    );

    return {
      tool: this.name,
      success: true,
      data: { query: input.query, total: items.length, items },
      summary: `${items.length} tour trovati tramite tour.data e tour-partecipazione.service`,
    };
  }
}
