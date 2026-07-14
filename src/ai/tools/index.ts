import { SearchClientsTool } from "./search-clients.tool";
import { SearchDashboardTool } from "./search-dashboard.tool";
import { SearchDocumentsTool } from "./search-documents.tool";
import { SearchPaymentsTool } from "./search-payments.tool";
import { SearchToursTool } from "./search-tours.tool";
import type { AiTool } from "../models/tool";

export function createDefaultAiTools(): AiTool[] {
  return [
    new SearchClientsTool(),
    new SearchToursTool(),
    new SearchPaymentsTool(),
    new SearchDashboardTool(),
    new SearchDocumentsTool(),
  ];
}

export {
  SearchClientsTool,
  SearchToursTool,
  SearchPaymentsTool,
  SearchDashboardTool,
  SearchDocumentsTool,
};
